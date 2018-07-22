import async from 'async';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcryptjs';
import mysql from '../config/mysql.config';
import redis from '../config/redis.config';
import schemas from '../schemas';

const signinHandler = {
  get(req, res) {
    if (req.isAuthenticated) {
      res.redirect('/account');
    } else {
      res.render('default/sign_in', {
        pageTitle: 'Sign In',
        pageInfo: req.pageInfo,
        logoFilePath: req.logoFilePath,
        account: req.account,
        categories: req.categories,
        isDemo: process.env.NODE_ENV !== 'production',
      });
    }
  },

  post(req, res) {
    const params = {
      email_address: req.body.email_address,
      password: req.body.password,
    };

    async.waterfall([
      // verify username exists
      (callback) => {
        mysql.query(
          `
            SELECT * FROM customers
            WHERE email_address = ?
            AND account_id = ?
            AND is_active = 1
            AND is_deleted = 0
          `,
          [params.email_address, req.account.id],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });

              return;
            }

            if (mysqlReply.length !== 1) {
              callback({ status: 401, data: { error: 'username/password invalid', code: 104 } });
            } else {
              callback(null, mysqlReply[0]);
            }
          },
        );
      },
      // validate password
      (customer, callback) => {
        const hashPassword = customer.password;

        bcrypt.compare(params.password, hashPassword, (error, isPasswordValid) => {
          if (error) {
            callback({ status: 500, data: { error: 'encrypt error', code: 104 } });

            return;
          }

          if (isPasswordValid) {
            callback(null, customer);
          } else {
            callback({ status: 401, data: { error: 'username/password invalid', code: 105 } });
          }
        });
      },
      // Set a session cookie in redis
      (customer, callback) => {
        const sessionId = uuidv4();

        redis.setex(
          `nimbus:${sessionId}:session`,
          14400,
          JSON.stringify(schemas.Customers(customer)),
          (redisError) => {
            if (redisError) {
              callback({ status: 500, data: { error: 'db error', code: 106 } });
            } else {
              callback(
                null,
                { data: Object.assign({}, schemas.Customers(customer), { sessionId }) },
              );
            }
          },
        );
      },
    ], (error, output) => {
      if (error) {
        res.status(error.status).send({ error });
      } else {
        res.cookie('ecom', output.data.sessionId, {
          httpOnly: true, // cookie cannot be accessed through client-side script
          signed: true, // verifies cookie hasn't been tampered with
          sameSite: true,
          secure: process.env.NODE_ENV === 'production', // cookie used https only
        });

        res.status(200).json({ message: 'success' });
      }
    });
  },
};

export default signinHandler;
