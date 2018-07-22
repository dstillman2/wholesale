import async from 'async';
import moment from 'moment';
import pool from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';

const myAccountHandler = {
  get(req, res) {
    const accountId = req.account.id;
    const orderId = req.params.orderId;

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
      direction: req.query.direction,
      where: { customer_id: req.customer.id },
    };

    async.waterfall([
      // get total count
      (callback) => {
        pool.query(
          query.totalCount(accountId, 'orders', parameters),
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
      // get orders
      (totalCount, callback) => {
        pool.query(
          query.getEntries(accountId, 'orders', orderId, parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
            } else {
              callback(null, schemas.Orders(mysqlReply, totalCount));
            }
          },
        );
      },
    ], (error, output) => {
      if (error) {
        res.status(error.status).json({ error });
      } else {
        res.render('default/account', {
          pageTitle: 'Order History',
          pageInfo: req.pageInfo,
          account: req.account,
          logoFilePath: req.logoFilePath,
          customer: req.customer,
          categories: req.categories,
          isLoggedIn: true,
          hasData: output.data.length > 0,
          data: output.data.map(item => ({
            id: item.id,
            price: `$${Number((item.price_total / 100).toFixed(2)).toLocaleString()}`,
            created_at: moment(item.created_at).format('LL'),
          })),
          isDemo: process.env.NODE_ENV !== 'production',
        });
      }
    });
  },
};

export default myAccountHandler;
