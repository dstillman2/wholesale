import async from 'async';
import bcrypt from 'bcryptjs';

import schemas from '../schemas';
import mysql from '../config/mysql.config';

const userHandler = {
  get(req, res) {
    res.json(schemas.Users([req.user]));
  },

  put(req, res) {
    async.waterfall([
      // validate password
      (callback) => {
        const currentPassword = req.body.current_password;

        bcrypt.compare(currentPassword, req.user.password, (error, isPasswordValid) => {
          if (error) {
            callback({ status: 500, data: { error: 'invalid password', code: 10049 } });

            return;
          }

          if (isPasswordValid) {
            callback(null);
          } else {
            callback({ status: 400, data: { error: 'username/password invalid', code: 105 } });
          }
        });
      },
      // generate salt
      (callback) => {
        bcrypt.genSalt(10, (saltGenError, salt) => {
          if (saltGenError) {
            callback({ status: 500, data: { error: saltGenError } });
          } else {
            callback(null, salt);
          }
        });
      },
      // generate password
      (salt, callback) => {
        bcrypt.hash(req.body.password, salt, (hashError, encryptedPassword) => {
          if (hashError) {
            callback({ status: 500, data: { error: hashError } });

            return;
          }

          callback(null, encryptedPassword);
        });
      },
      (encryptedPassword, callback) => {
        mysql.query(
          `
            UPDATE users
            SET ?
            WHERE id=${req.user.id}
          `,
          { password: encryptedPassword },
          (mysqlError) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });
            } else {
              callback(null);
            }
          },
        );
      },
    ], (error) => {
      if (error) {
        res.status(error.status).json({ error });

        return;
      }

      res.json({ message: 'success' });
    });
  },
};

export default userHandler;
