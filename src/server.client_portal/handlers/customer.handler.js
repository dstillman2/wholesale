import async from 'async';
import pool from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';

const customerHandler = {
  get(req, res) {
    const accountId = req.user.accountId;
    const customerId = Number(req.params.customerId);

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
      direction: req.query.direction,
      search: req.query.search,
      searchColumns: ['first_name', 'last_name', 'company'],
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.read.customers) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      // get total count
      (callback) => {
        if (customerId) {
          callback(null, 1);

          return;
        }

        pool.query(
          query.totalCount(accountId, 'customers', parameters),
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
        pool.query(
          query.getEntries(accountId, 'customers', customerId, parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
            } else {
              callback(null, schemas.Customers(mysqlReply, totalCount));
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
    const customerId = req.params.customerId;
    const accountId = req.user.accountId;

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.write.customers) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      (callback) => {
        const fields = schemas.Customers(req.body).data;

        const output = {
          company: fields.company,
          first_name: fields.first_name,
          last_name: fields.last_name,
          address_1: fields.address_1,
          address_2: fields.address_2,
          email_address: fields.email_address,
          EIN: fields.EIN,
          city: fields.city,
          state: fields.state,
          zip_code: fields.zip_code,
          discount: fields.discount,
          phone_number: fields.phone_number,
          is_active: fields.is_active,
          updated_at: new Date(),
        };

        pool.query(
          `
            UPDATE customers
            SET ?
            WHERE id=${customerId}
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
    const fields = schemas.Customers(req.body).data;
    const accountId = req.user.accountId;

    const output = {
      company: fields.company,
      first_name: fields.first_name,
      last_name: fields.last_name,
      address_1: fields.address_1,
      address_2: fields.address_2,
      email_address: fields.email_address,
      EIN: fields.EIN,
      city: fields.city,
      state: fields.state,
      zip_code: fields.zip_code,
      phone_number: fields.phone_number,
      discount: fields.discount,
      is_active: fields.is_active,
      account_id: accountId,
      created_at: new Date(),
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.write.customers) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      (callback) => {
        pool.query(
          `
            INSERT INTO customers SET ?
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

  delete(req, res) {
    const accountId = req.user.accountId;
    const customerId = req.params.customerId;

    if (!customerId) {
      res.status(400).end();

      return;
    }

    pool.getConnection((error, connection) => {
      if (error) {
        res.status(500).end();

        return;
      }

      async.waterfall([
        // check permissions
        (callback) => {
          if (!req.permissions.write.products) {
            callback({ message: 'forbidden', status: 403 });
          } else {
            callback(null);
          }
        },
        (callback) => {
          connection.query(
            `
              UPDATE customers
              SET is_deleted = 1
              WHERE id = ?
              AND is_deleted = 0
              AND account_id = ?
            `,
            [customerId, accountId],
            (mysqlError, results) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else if (results.changedRows !== 1) {
                callback({ status: 500, data: { error: 'invalid id' } });
              } else {
                callback(null);
              }
            },
          );
        },
        (callback) => {
          connection.query(
            `
              UPDATE order_items
              SET customer_id = NULL
              WHERE customer_id = ?
            `,
            customerId,
            (mysqlError) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null);
              }
            },
          );
        },
        (callback) => {
          connection.query(
            `
              UPDATE orders
              SET customer_id = NULL
              WHERE customer_id = ?
            `,
            customerId,
            (mysqlError) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null);
              }
            },
          );
        },
        (callback) => {
          connection.query(
            `
              SELECT * FROM customers
              WHERE id = ?
            `,
            customerId,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null, mysqlReply);
              }
            },
          );
        },
      ], (waterfallError) => {
        if (waterfallError) {
          connection.rollback(() => {
            res.status(waterfallError.status).send({ error });
          });
        } else {
          connection.commit((commitError) => {
            if (commitError) {
              connection.rollback(() => {
                res.status(500).send({ error: commitError });
              });
            } else {
              connection.release();

              res.json({ data: 'success' });
            }
          });
        }
      });
    });
  },
};

export default customerHandler;
