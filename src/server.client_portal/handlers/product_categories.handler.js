import async from 'async';
import mysql from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';

const productHandler = {
  get(req, res) {
    const accountId = req.user.accountId;
    const productCategoryId = req.params.productCategoryId;

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
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
        if (productCategoryId) {
          callback(null, 1);

          return;
        }

        mysql.query(
          query.totalCount(accountId, 'product_categories', parameters),
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
          query.getEntries(accountId, 'product_categories', productCategoryId, parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
            } else {
              callback(null, schemas.ProductCategories(mysqlReply, totalCount));
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
    const categoryId = req.params.categoryId;
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
        const output = {
          field: req.body.field,
          options: req.body.options,
          updated_at: new Date(),
        };

        mysql.query(
          `
            UPDATE product_categories
            SET ?
            WHERE id = ?
            AND account_id= ?
            AND is_deleted = 0
          `,
          [output, categoryId, accountId],
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
        const output = {
          account_id: accountId,
          field: req.body.field,
          options: req.body.options,
          is_deleted: 0,
          created_at: new Date(),
        };

        mysql.query(
          `
            INSERT INTO product_categories
            SET ?
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
    const categoryId = req.params.categoryId;

    if (!categoryId) {
      res.status(400).end();

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
        mysql.query(
          `
            UPDATE product_categories
            SET is_deleted = 1
            WHERE id = ?
            AND account_id = ?
            AND is_deleted = 0
          `,
          [categoryId, accountId],
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

export default productHandler;
