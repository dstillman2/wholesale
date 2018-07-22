import uuidv4 from 'uuid/v4';
import async from 'async';
import sendgrid from 'sendgrid';
import moment from 'moment';
import redis from '../config/redis.config';
import mysql from '../config/mysql.config';
import { SENDGRID_API_KEY } from '../options';

const forgotPasswordHandler = {
  get(req, res) {
    if (req.isAuthenticated) {
      res.redirect('/account');
    } else {
      res.render('default/forgot_password', {
        pageTitle: 'Forgot Password',
        pageInfo: req.pageInfo,
        logoFilePath: req.logoFilePath,
        account: req.account,
        categories: req.categories,
        isDemo: process.env.NODE_ENV !== 'production',
      });
    }
  },

  post(req, res) {
    async.waterfall([
      // Check if email is in the database
      (callback) => {
        mysql.query(
          `
            SELECT id, email_address FROM customers
            WHERE email_address = ?
            AND is_deleted = 0
            AND account_id = ?
          `,
          [req.body.email_address, req.account.id],
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
      (customerId, emailAddress, callback) => {
        const uniqueId = uuidv4() + moment().unix();
        redis.setex(
          `ecom:${uniqueId}`,
          1800,
          JSON.stringify({ customerId }),
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
        const sg = sendgrid(req.marketplaceSettings.sendgrid_api_key || SENDGRID_API_KEY);

        let protocol = 'http';

        if (req.connection.encrypted) {
          protocol = 'https';
        }

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
              email: req.marketplaceSettings.automated_email,
            },
            content: [
              {
                type: 'text/html',
                value: `
                  <p>Please
                  <a href="${req.marketplaceSettings.domain}/reset-password?token=${uniqueId}">click here</a>
                  or enter the link below into your browser to reset your password.</p>
                  ${protocol}://${req.headers.host}/reset-password?token=${uniqueId}
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
