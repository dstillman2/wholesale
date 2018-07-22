import async from 'async';
import pool from '../config/mysql.config';

function updateCustomers({ accountId, customerId }, timeout = 0) {
  if (!customerId) {
    return;
  }

  global.setTimeout(() => {
    async.waterfall([
      (callback) => {
        pool.query(
          `
            SELECT SUM(price_total), COUNT(*) FROM orders
            WHERE (
              account_id = ?
              AND customer_id = ?
              AND is_deleted = 0
            )
          `,
          [accountId, customerId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              return;
            }

            const totalPrice = mysqlReply[0]['SUM(price_total)'];
            const count = mysqlReply[0]['COUNT(*)'];

            callback(null, totalPrice, count);
          },
        );
      },
      (totalPrice, count, callback) => {
        pool.query(
          `
            UPDATE customers
            SET ?
            WHERE (
              account_id = ?
              AND id = ?
              AND is_deleted = 0
            )
          `,
          [
            {
              total_orders: count,
              total_revenue: totalPrice,
              updated_at: new Date(),
            },
            accountId,
            customerId,
          ],
          (mysqlError) => {
            // TODO log errors

            callback(null);
          },
        );
      },
    ]);
  }, timeout);
}

export default updateCustomers;
