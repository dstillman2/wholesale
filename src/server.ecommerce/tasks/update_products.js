import async from 'async';
import pool from '../config/mysql.config';

function updateProducts({ accountId, productId }, timeout = 0) {
  if (!productId) {
    return;
  }

  global.setTimeout(() => {
    async.waterfall([
      (callback) => {
        pool.query(
          `
            SELECT COUNT(*), SUM(quantity) FROM order_items
            WHERE
            account_id = ?
            AND product_id = ?
            AND is_deleted = 0
          `,
          [accountId, productId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              return;
            }

            const qtySold = mysqlReply[0]['SUM(quantity)'] || 0;
            const totalOrders = mysqlReply[0]['COUNT(*)'] || 0;

            callback(null, totalOrders, qtySold);
          },
        );
      },
      (totalOrders, qtySold, callback) => {
        pool.query(
          `
            UPDATE products
            SET ?
            WHERE id = ?
          `,
          [
            {
              total_orders: totalOrders,
              qty_sold: qtySold,
              updated_at: new Date(),
            },
            productId,
          ],
          (mysqlError, mysqlReply) => {
           },
        );
      },
    ]);
  }, timeout);
}

export default updateProducts;
