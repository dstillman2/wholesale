import async from 'async';
import pool from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';
import tasks from '../tasks';

const productHandler = {
  get(req, res) {
    const accountId = req.user.accountId;
    const productId = Number(req.params.productId);

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
      direction: req.query.direction,
      search: req.query.search,
      searchColumns: ['name', 'categories'],
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.read.products) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      // get total count
      (callback) => {
        if (productId) {
          callback(null, 1);

          return;
        }

        pool.query(
          query.totalCount(accountId, 'products', parameters),
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
          query.getEntries(accountId, 'products', productId, parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
            } else {
              callback(null, schemas.Products(mysqlReply, totalCount));
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
    const productId = req.params.productId;
    const accountId = req.user.accountId;

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
        const fields = schemas.Products(req.body).data;

        const output = {
          name: fields.name,
          categories: fields.categories,
          description: fields.description,
          lead_time: fields.lead_time,
          image_uploads: fields.image_uploads,
          inventory: fields.inventory,
          hasInventoryTracking: fields.hasInventoryTracking,
          isSellingOOS: fields.isSellingOOS || 0,
          price: fields.price,
          is_active_marketplace: fields.is_active_marketplace,
          updated_at: new Date(),
        };

        pool.query(
          `
            UPDATE products
            SET ?
            WHERE id=${productId}
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

      tasks.updateProducts({
        accountId,
        productId,
      });
    });
  },

  post(req, res) {
    const accountId = req.user.accountId;
    const fields = req.body;

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
        pool.query(
          `
            INSERT INTO products SET ?
          `,
          Object.assign({}, schemas.Products(fields).data, {
            account_id: accountId,
            qty_sold: 0,
            total_orders: 0,
            created_at: new Date(),
          }),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });
            } else {
              const productId = mysqlReply.insertId;

              callback(null, productId);
            }
          },
        );
      },
    ], (error, productId) => {
      if (error) {
        res.status(error.status).json({ error });

        return;
      }

      res.json({ message: 'success' });

      tasks.updateProducts({
        accountId,
        productId,
      });
    });
  },

  delete(req, res) {
    const accountId = req.user.accountId;
    const productId = req.params.productId;

    if (!productId) {
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
              UPDATE products
              SET is_deleted = 1
              WHERE id = ?
              AND is_deleted = 0
              AND account_id = ?
            `,
            [productId, accountId],
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
              SET product_id = NULL
              WHERE product_id = ?
            `,
            productId,
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
              SELECT * FROM products
              WHERE id = ?
            `,
            productId,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null, mysqlReply);
              }
            },
          );
        },
      ], (waterfallError, output) => {
        if (waterfallError) {
          connection.rollback(() => {
            res.status(error.status).send({ error });
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

              tasks.updateProducts({ accountId, productId });
              tasks.createActivity({
                accountId,
                userId: req.user.id,
                action: 'products.delete',
                data: JSON.stringify(output),
              });
            }
          });
        }
      });
    });
  },
};

export default productHandler;
