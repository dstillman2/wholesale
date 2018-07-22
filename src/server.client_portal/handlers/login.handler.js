import async from 'async';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcryptjs';
import schemas from '../schemas';
import { NODE_ENV } from '../options';
import generateKey from '../lib/generate_key';

import mysql from '../config/mysql.config';
import redis from '../config/redis.config';

const loginHandler = {
  get(req, res) {
    if (req.isAuthenticated) {
      res.redirect('/account/dashboard');
    } else {
      res.render('index', Object.assign(
        {
          isLogin: true,
          page: 'login',
          classList: 'login',
          permissions: JSON.stringify({ read: {}, write: {} }),
          categories: JSON.stringify([]),
          flags: '{}',
          name: '',
          isProduction: NODE_ENV === 'production',
        },
      ));
    }
  },

  /**
   * On login, validate credentials. If valid, set a cookie to allow the agent to
   * log in, and update the agent status in sql to true.
   */
  post(req, res) {
    const params = {
      username: req.body.email_address,
      password: req.body.password,
    };

    async.waterfall([
      // verify username exists
      (callback) => {
        mysql.query(
          `
            SELECT * FROM users
            WHERE (email_address=? OR username=?)
            AND is_deleted=0
          `,
          [params.username, params.username],
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
      (userQuery, callback) => {
        const hashPassword = userQuery.password;

        bcrypt.compare(params.password, hashPassword, (error, isPasswordValid) => {
          if (error) {
            callback({ status: 500, data: { error: 'encrypt error', code: 104 } });

            return;
          }

          if (isPasswordValid) {
            callback(null, userQuery);
          } else {
            callback({ status: 401, data: { error: 'username/password invalid', code: 105 } });
          }
        });
      },
      // Set a session cookie in redis
      (userQuery, callback) => {
        const sessionId = uuidv4();

        redis.setex(
          `nimbus:${sessionId}:session`,
          14400,
          JSON.stringify(
            Object.assign(
              {},
              schemas.Users(userQuery),
              { csrfToken: generateKey() },
            ),
          ),
          (redisError) => {
            if (redisError) {
              callback({ status: 500, data: { error: 'db error', code: 106 } });
            } else {
              callback(
                null,
                { data: Object.assign({}, schemas.Users(userQuery), { sessionId }) },
              );
            }
          },
        );
      },
    ], (error, output) => {
      if (error) {
        res.status(error.status).send({ error });
      } else {
        // create a session cookie
        res.cookie('st', output.data.sessionId, {
          httpOnly: true, // cookie cannot be accessed through client-side script
          signed: true, // verifies cookie hasn't been tampered with
          sameSite: true,
          secure: NODE_ENV === 'production', // cookie used https only
        });

        res.json(output);
      }
    });
  },
};

export default loginHandler;
