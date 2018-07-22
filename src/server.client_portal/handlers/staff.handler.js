import async from 'async';
import bcrypt from 'bcryptjs';
import mysql from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';

const staffHandler = {
  get(req, res) {
    const accountId = req.user.accountId;
    const staffId = Number(req.params.staffId);

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
      direction: req.query.direction,
      search: req.query.search,
      searchColumns: ['first_name', 'last_name'],
      where: { is_staff: true },
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.isAdministrator) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      // get total count
      (callback) => {
        if (staffId) {
          callback(null, 1);

          return;
        }

        mysql.query(
          query.totalCount(accountId, 'users', parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 1, error: mysqlError });
            } else {
              const totalCount = mysqlReply[0]['COUNT(*)'];

              callback(null, totalCount);
            }
          },
        );
      },
      (totalCount, callback) => {
        mysql.query(
          query.getEntries(accountId, 'users', staffId, parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
            } else {
              callback(null, schemas.Staff(mysqlReply, totalCount));
            }
          },
        );
      },
    ], (error, output) => {
      if (error) {
        res.status(error.status).json({ error });
      } else {
        res.json(output);
      }
    });
  },

  put(req, res) {
    const staffId = req.params.staffId;
    const accountId = req.user.accountId;

    const fields = schemas.Staff(req.body).data;

    let output = {
      first_name: fields.first_name,
      last_name: fields.last_name,
      is_active: fields.is_active,
      permissions: fields.permissions,
      updated_at: new Date(),
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.isAdministrator) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      // generate salt
      (callback) => {
        if (!req.body.password) {
          callback(null, 'no_password');

          return;
        }

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
        if (salt === 'no_password') {
          callback(null, 'no_password');

          return;
        }

        bcrypt.hash(req.body.password, salt, (hashError, encryptedPassword) => {
          if (hashError) {
            callback({ status: 500, data: { error: hashError } });

            return;
          }

          callback(null, encryptedPassword);
        });
      },
      (password, callback) => {
        if (password !== 'no_password') {
          output = Object.assign({}, output, { password });
        }

        mysql.query(
          `
            UPDATE users
            SET ?
            WHERE id=${staffId}
            AND account_id=${accountId}
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

  post(req, res) {
    const fields = schemas.Staff(req.body).data;
    const accountId = req.user.accountId;

    const output = {
      first_name: fields.first_name,
      last_name: fields.last_name,
      username: fields.username,
      is_staff: true,
      is_active: fields.is_active,
      permissions: fields.permissions,
      account_id: accountId,
      created_at: new Date(),
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.isAdministrator) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      // check if username is unique
      (callback) => {
        mysql.query(
          `
            SELECT * FROM users
            WHERE username="${output.username}"
            AND is_deleted=0
          `,
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });
            } else if (mysqlReply.length !== 0) {
              callback({ status: 400, data: { error: 'username taken', code: 100055 } });
            } else {
              callback(null);
            }
          },
        );
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
            INSERT INTO users SET ?
          `,
          Object.assign({}, output, { password: encryptedPassword }),
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

  delete(req, res) {
    const staffId = req.params.staffId;
    const accountId = req.user.accountId;

    if (!staffId) {
      res.status(400).end();

      return;
    }

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
        mysql.query(
          `
            UPDATE users
            SET ?
            WHERE id=${staffId}
            AND account_id=${accountId}
            AND is_deleted=0
          `,
          { is_deleted: 1 },
          (error, results) => {
            if (error) {
              callback({ status: 500, data: { error, code: 150 } });
            } else if (results.changedRows !== 1) {
              callback({ status: 500, data: { error: 'invalid id', code: 150 } });
            } else {
              callback(null);
            }
          },
        );
      },
    ], (error) => {
      if (error) {
        res.status(error.status).send({ error });
      } else {
        res.json({ data: 'success' });
      }
    });
  },
};

export default staffHandler;
