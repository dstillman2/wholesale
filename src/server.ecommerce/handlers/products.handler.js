import async from 'async';
import pool from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';

const productHandler = {
  get(req, res) {
    const productId = req.params.productId;
    const accountId = req.account.id;

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
      direction: req.query.direction,
      search: req.query.search,
      searchColumns: ['name', 'categories'],
    };

    async.waterfall([
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
        const data = output.data[0] || {};

        let primaryImage;

        if (
          data.image_uploads &&
          Array.isArray(JSON.parse(data.image_uploads)) &&
          JSON.parse(data.image_uploads).length > 0) {
          primaryImage = `/images/${JSON.parse(data.image_uploads)[0]}`;
        }

        const hasInventory = (
          data.hasInventoryTracking &&
          !data.isSellingOOS &&
          data.inventory > 0
        ) || (
          !data.hasInventoryTracking
        ) || (
          data.isSellingOOS
        );

        res.render('default/product', Object.assign({},
          {
            hasInventory,
            hasInventoryCount: data.hasInventoryTracking && !data.isSellingOOS,
            inventory: data.inventory,
            hasData: !!output.data[0],
            data: {
              productId: data.id,
              name: data.name,
              primaryImage,
              price: Number((data.price / 100).toFixed(2)),
              description: data.description || 'No description available.',
              inventory: data.inventory,
            },
            isValidProductPage: !!output.data,
            logoFilePath: req.logoFilePath,
            pageInfo: req.pageInfo,
            account: req.account,
            isLoggedIn: req.isAuthenticated,
            categories: req.categories,
            pageTitle: data.name,
            isDemo: process.env.NODE_ENV !== 'production',
          },
        ));
      }
    });
  },
};

export default productHandler;
