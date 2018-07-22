import async from 'async';
import pool from '../config/mysql.config';

const statisticHandler = {
  get(req, res) {
    const accountId = req.account.id;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    let previousMonth = currentMonth - 1;

    if (currentMonth === 1) {
      previousMonth = 12;
    }

    let output = {};

    async.waterfall([
      (callback) => {
        pool.query(
          `
            (SELECT SUM(price_total), COUNT(*), FLOOR(AVG(price_total))
            FROM orders
            WHERE created_at between '${previousYear}-${previousMonth}-01' and '${previousYear}-${previousMonth}-31 23:59:59.999'
            AND is_deleted = 0
            AND account_id = ?)
            UNION
            (SELECT SUM(price_total), COUNT(*), FLOOR(AVG(price_total))
            FROM orders
            WHERE created_at between '${currentYear}-${currentMonth}-01' and '${currentYear}-${currentMonth}-31 23:59:59.999'
            AND is_deleted = 0
            AND account_id = ?)
          `,
          [accountId, accountId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              res.status(500).json({ error: 'sql error' });

              return;
            }

            const previousMonth = mysqlReply[0] || {};
            const currentMonth = mysqlReply[1] || {};

            output = Object.assign({}, output, {
              currentMonth: {
                total_revenue: currentMonth['SUM(price_total)'] || 0,
                orders: currentMonth['COUNT(*)'] || 0,
                average_sale: currentMonth['FLOOR(AVG(price_total))'] || 0,
              },
              previousMonth: {
                total_revenue: previousMonth['SUM(price_total)'] || 0,
                orders: previousMonth['COUNT(*)'] || 0,
                average_sale: previousMonth['FLOOR(AVG(price_total))'] || 0,
              },
            });

            callback(null);
          },
        );
      },
      (callback) => {
        pool.query(
          `
            SELECT YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as orders, FLOOR(SUM(price_total)) as revenue
            from orders
            WHERE account_id = ?
            AND is_deleted = 0
            GROUP BY YEAR(created_at), MONTH(created_at)
          `,
          [accountId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              res.status(500).json({ error: 'sql error' });

              return;
            }

            output = Object.assign({}, output, { history: mysqlReply });

            callback(null);
          },
        );
      },
    ], (error) => {
      if (error) {
        res.status(error.status).json({ error });

        return;
      }

      res.json(output);
    });
  },
};

export default statisticHandler;
