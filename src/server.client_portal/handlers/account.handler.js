import async from 'async';

import schemas from '../schemas';
import mysql from '../config/mysql.config';

const accountHandler = {
  get(req, res) {
    res.json(schemas.Accounts([req.account]));
  },

  put(req, res) {
    const accountId = req.user.accountId;

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.isAdministrator) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      (callback) => {
        const fields = schemas.Accounts(req.body).data;

        let output = {
          company: fields.company,
          phone_number: fields.phone_number,
          address_1: fields.address_1,
          address_2: fields.address_2,
          city: fields.city,
          state: fields.state,
          zip_code: fields.zip_code,
          email_address: fields.email_address,
          updated_at: new Date(),
        };

        if (fields.subdomain || fields.domain) {
          output = {};
        }

        if (fields.subdomain) {
          output.subdomain = fields.subdomain;
        }

        if (fields.domain) {
          output.domain = fields.domain;
        }

        mysql.query(
          `
            UPDATE accounts
            SET ?
            WHERE id=${accountId}
          `,
          output,
          (mysqlError) => {
            if (mysqlError) {
              if (mysqlError.message.includes('unique_domain')) {
                callback({ status: 400, data: { error: 'unique_domain must be unique', errorId: 5 } });
              } else if (mysqlError.message.includes('unique_sub')) {
                callback({ status: 400, data: { error: 'unique_sub must be unique', errorId: 6 } });
              } else {
                callback({ status: 500, data: { error: mysqlError } });
              }
            } else {
              callback(null);
            }
          },
        );
      },
    ], (error) => {
      if (error) {
        res.status(error.status).json(error);

        return;
      }

      res.json({ message: 'success' });
    });
  },
};

export default accountHandler;
