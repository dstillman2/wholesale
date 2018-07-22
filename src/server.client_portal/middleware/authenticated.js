import async from 'async';

import mysql from '../config/mysql.config';
import redis from '../config/redis.config';

import { snakeToCamelConverter } from '../lib/key_format';

function authenticated(req, res, next) {
  const sessionToken = req.signedCookies.st;
  const isAjaxRequest = req.headers['x-requested-with'] === 'xhr';

  async.waterfall([
    // Convert session token to agent id by retrieving from redis database.
    (callback) => {
      redis.get(`nimbus:${sessionToken}:session`, (redisError, redisReply) => {
        if (redisError) {
          callback({ status: 401, data: redisError });

          return;
        }

        if (!redisReply) {
          callback({ status: 401, data: 'invalid authentication' });

          return;
        }

        const data = JSON.parse(redisReply);

        req.csrfToken = data.csrfToken;

        callback(null, data.data.id);
      });
    },
    // Retrieve agent information, verifying login credentials.
    (adminUserId, callback) => {
      mysql.query(
        `
          SELECT * FROM users
          WHERE id = ? AND is_deleted = 0
        `,
        adminUserId,
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            callback({ status: 401, data: mysqlError });

            return;
          }

          if (mysqlReply.length !== 1) {
            callback({ status: 401, data: 'invalid authentication' });
          } else {
            callback(null, mysqlReply[0]);
          }
        },
      );
    },
    (userInfo, callback) => {
      mysql.query(
        `
          SELECT * FROM accounts
          WHERE id = ? AND is_deleted = 0
        `,
        userInfo.account_id,
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            callback({ status: 401, data: mysqlError });

            return;
          }

          if (mysqlReply.length !== 1) {
            callback({ status: 401, data: 'invalid authentication' });
          } else {
            callback(null, userInfo, mysqlReply[0]);
          }
        },
      );
    },
  ], (error, userInfo, accountInfo) => {
    if (error && isAjaxRequest) {
      res.status(error.status).end();
    } else if (error) {
      res.redirect('/login');
    } else {
      req.user = Object.assign({}, userInfo, snakeToCamelConverter(userInfo));
      req.account = Object.assign({}, accountInfo, snakeToCamelConverter(accountInfo));
      req.permissions = typeof req.user.permissions === 'string' ? JSON.parse(req.user.permissions) : {
        read: {},
        write: {},
      };

      next();
    }
  });
}

export default authenticated;
