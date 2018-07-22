import async from 'async';
import pool from '../config/mysql.config';

const productInventoryHandler = {
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
        if (isNaN(Number(req.body.value))) {
          callback({ status: 400, data: { error: 'invalid inventory value' } });

          return;
        }

        pool.query(
          `
            SELECT inventory FROM products
            WHERE id = ?
            AND account_id = ?
            AND hasInventoryTracking = 1
            AND is_deleted = 0
            LIMIT 1
          `,
          [productId, accountId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });
            } else {
              const inventory = Number(mysqlReply[0].inventory);

              if (isNaN(inventory)) {
                callback({ status: 400, data: { error: 'invalid inventory count' } });
              } else {
                callback(null, inventory);
              }
            }
          },
        );
      },
      (inventory, callback) => {
        let newInventoryCount = inventory;

        if (req.body.type === 'add') {
          newInventoryCount = inventory + Number(req.body.value);
        } else if (req.body.type === 'set') {
          newInventoryCount = Number(req.body.value);
        }

        pool.query(
          `
            UPDATE products
            SET inventory = ?
            WHERE id = ?
            AND account_id = ?
            AND is_deleted = 0
          `,
          [newInventoryCount, productId, accountId],
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

export default productInventoryHandler;
