import async from 'async';
import mysql from '../config/mysql.config';
import redis from '../config/redis.config';
import schemas from '../schemas';

function fetchCustomer(req, res, next) {
  if (req.originalUrl.includes('vendor/assets')) {
    next();

    return;
  }

  const sessionToken = req.signedCookies.ecom;

  async.waterfall([
    // verify username exists
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

        callback(null, JSON.parse(redisReply).data.id);
      });
    },
    (customerId, callback) => {
      mysql.query(
        `
          SELECT * FROM customers
          WHERE id= ?
          AND is_active = 1
          AND is_deleted = 0
        `,
        customerId,
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            callback({ status: 401, data: mysqlError });

            return;
          }

          if (mysqlReply.length !== 1) {
            callback({ status: 401, data: 'invalid authentication' });
          } else {
            callback(null, schemas.Customers(mysqlReply));
          }
        },
      );
    },
  ], (error, output) => {
    if (!error) {
      req.isAuthenticated = !!output;
      req.customer = output.data[0];
    }

    next();
  });
}

export default fetchCustomer;
