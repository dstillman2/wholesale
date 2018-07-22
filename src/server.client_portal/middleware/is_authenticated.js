import async from 'async';

import mysql from '../config/mysql.config';
import redis from '../config/redis.config';

function checkIfAuthenticated(req, res, next) {
  const sessionToken = req.signedCookies.st;

  async.waterfall([
    // Convert session token to agent id by retrieving from redis database.
    (callback) => {
      redis.get(`nimbus:${sessionToken}:session`, (redisError, redisReply) => {
        if (redisError) {
          callback('unauth');

          return;
        }

        if (!redisReply) {
          callback('unauth');

          return;
        }

        const reply = JSON.parse(redisReply);

        callback(null, reply.data.id);
      });
    },
    // Retrieve agent information, verifying login credentials.
    (adminUserId, callback) => {
      mysql.query(
        `
          SELECT * FROM users
          WHERE id = ?
          AND is_deleted = 0
        `,
        [adminUserId],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            callback({ status: 401, data: mysqlError });

            return;
          }

          if (mysqlReply.length !== 1) {
            callback('unauth');
          } else {
            callback(null, mysqlReply[0]);
          }
        },
      );
    },
  ], (error) => {
    if (error) {
      req.isAuthenticated = false;
    } else {
      req.isAuthenticated = true;
    }

    next();
  });
}

export default checkIfAuthenticated;
