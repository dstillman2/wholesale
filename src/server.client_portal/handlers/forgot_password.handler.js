import uuidv4 from 'uuid/v4';
import async from 'async';
import sendgrid from 'sendgrid';
import moment from 'moment';
import redis from '../config/redis.config';
import mysql from '../config/mysql.config';
import { SENDGRID_API_KEY } from '../options';

const forgotPasswordHandler = {
  post(req, res) {
    async.waterfall([
      // Check if email is in the database
      (callback) => {
        mysql.query(
          `
            SELECT id, email_address FROM users
            WHERE email_address = ?
            AND is_deleted = 0
          `,
          [req.body.email_address],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });
            } else if (mysqlReply.length !== 1) {
              callback({ status: 500, data: { error: 'must return 1 entry' } });
            } else {
              const output = mysqlReply[0];

              callback(null, output.id, req.body.email_address);
            }
          },
        );
      },
      // set redis reset password token
      (userId, emailAddress, callback) => {
        const uniqueId = uuidv4() + moment().unix();

        redis.setex(
          `on:${uniqueId}:forgotpassword`,
          1800,
          JSON.stringify({ userId }),
          (error) => {
            if (error) {
              callback({ status: 500, data: { error: 'redis error' } });

              return;
            }

            callback(null, uniqueId, emailAddress);
          },
        );
      },
      // send sendgrid email
      (uniqueId, emailAddress, callback) => {
        const sg = sendgrid(SENDGRID_API_KEY);

        const request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: {
            personalizations: [
              {
                to: [
                  {
                    email: emailAddress,
                  },
                ],
                subject: 'OrderNimbus - Forgot Password',
              },
            ],
            from: {
              email: 'noreply@ordernimbus.com',
            },
            content: [
              {
                type: 'text/html',
                value: `
                  <p>Please
                  <a href="https://dashboard.ordernimbus.com/reset-password?token=${uniqueId}">click here</a>
                  or enter the link below into your browser to reset your password.</p>
                  https://dashboard.ordernimbus.com/reset-password?token=${uniqueId}
                `,
              },
            ],
          },
        });

        sg.API(request, (error) => {
          if (error) {
            callback({ status: 500, data: { error: 'sendgrid error' } });
          } else {
            callback(null);
          }
        });
      },
    ], (error) => {
      if (error) {
        res.status(error.status).json(error);

        return;
      }

      res.status(200).end();
    });
  },
};

export default forgotPasswordHandler;
