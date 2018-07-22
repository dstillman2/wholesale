import async from 'async';

import schemas from '../schemas';
import mysql from '../config/mysql.config';

const userHandler = {
  get(req, res) {
    res.json(schemas.Users([req.user]));
  },

  put(req, res) {
    async.waterfall([
      (callback) => {
        const fields = schemas.Users(req.body).data;

        const output = {
          first_name: fields.first_name,
          last_name: fields.last_name,
          updated_at: new Date(),
        };

        mysql.query(
          `
            UPDATE users
            SET ?
            WHERE id=${req.user.id}
          `,
          output,
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
