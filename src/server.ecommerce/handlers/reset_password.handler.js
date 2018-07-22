import async from 'async';
import bcrypt from 'bcryptjs';
import redis from '../config/redis.config';
import mysql from '../config/mysql.config';

const resetPasswordHandler = {
  get(req, res) {
    if (req.isAuthenticated) {
      res.redirect('/account');
    } else {
      res.render('default/reset_password', {
        pageTitle: 'Reset Password',
        pageInfo: req.pageInfo,
        logoFilePath: req.logoFilePath,
        account: req.account,
        isDemo: process.env.NODE_ENV !== 'production',
        categories: req.categories,
      });
    }
  },

  post(req, res) {
    async.series([
      (callback) => {
        redis.get(`ecom:${req.body.token}`, (error, reply) => {
          if (error) {
            callback({ status: 400, data: { error: 'internal' } });

            return;
          }

          const output = JSON.parse(reply);

          if (!output) {
            callback({ status: 400, data: { error: 'internal' } });

            return;
          }

          redis.del(`ecom:${req.body.token}`);

          callback(null, output.customerId);
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
          UPDATE customers
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
