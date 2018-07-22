import async from 'async';
import bcrypt from 'bcryptjs';
import redis from '../config/redis.config';
import mysql from '../config/mysql.config';

const resetPasswordHandler = {
  post(req, res) {
    async.series([
      (callback) => {
        redis.get(`on:${req.body.token}:forgotpassword`, (error, reply) => {
          if (error || !reply) {
            callback({ status: 400, data: { error: 'internal' } });

            return;
          }

          const output = JSON.parse(reply);

          if (!output) {
            callback({ status: 400, data: { error: 'internal' } });

            return;
          }

          redis.del(`on:${req.body.token}:forgotpassword`);

          callback(null, output.userId);
        });
      },
      (callback) => {
        bcrypt.genSalt(10, (error, salt) => {
          bcrypt.hash(req.body.password, salt, (bcryptError, hash) => {
            if (bcryptError) {
              callback({ status: 500, data: { error: 'internal' } });

              return;
            }

            callback(null, hash);
          });
        });
      },
    ], (error, results) => {
      if (error) {
        res.status(error.status).json(error);

        return;
      }

      mysql.query(
        `
          UPDATE users
          SET password = ?
          WHERE id = ?
        `,
        [results[1], results[0]],
        (mysqlError) => {
          if (mysqlError) {
            res.status(500).json({ data: { error: 'sql error' } });
          } else {
            res.end();
          }
        },
      );
    });
  },
};

export default resetPasswordHandler;
