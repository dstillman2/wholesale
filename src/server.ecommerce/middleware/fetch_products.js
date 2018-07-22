import async from 'async';
import pool from '../config/mysql.config';

function fetchBestProductsAndCategory(req, res, next) {
  if (req.originalUrl.includes('vendor/assets')) {
    next();

    return;
  }

  async.waterfall([
    // get best sellers
    (callback) => {
      pool.query(
        `
          SELECT * FROM products
          WHERE is_deleted = 0
          AND account_id = ?
          AND ((
            hasInventoryTracking = 1
            AND isSellingOOS = 0
            AND inventory > 0
          ) OR (
            hasInventoryTracking = 1
            AND isSellingOOS = 1
          ) OR (
            hasInventoryTracking = 0
            OR
            hasinventoryTracking = NULL
          ))
          ORDER BY qty_sold DESC
          LIMIT 6
        `,
        [req.account.id],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            res.status(500).json({ error: mysqlError });

            return;
          }

          req.bestSellers = mysqlReply.map((item) => {
            let primaryImage;

            if (
              Array.isArray(JSON.parse(item.image_uploads))
              && JSON.parse(item.image_uploads).length > 0
            ) {
              primaryImage = `/images/${JSON.parse(item.image_uploads)[0]}`;
            }

            return {
              id: item.id,
              name: item.name,
              primaryImage,
              price: `$${Number((item.price / 100).toFixed(2))}`,
            };
          });

          callback(null);
        },
      );
    },
    // fetch marketplace settings
    (callback) => {
      pool.query(
        `
          SELECT * FROM marketplace_settings
          WHERE account_id = ?
        `,
        req.account.id,
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            res.status(500).json({ error: 'sql error', errorId: 2 });

            return;
          }

          if (mysqlReply.length !== 1) {
            res.status(500).json({ error: 'account configuration error' });

            return;
          }

          req.marketplaceSettings = mysqlReply[0];

          let logoFilePath;

          if (req.marketplaceSettings.logo_path) {
            logoFilePath = `/images/${JSON.parse(req.marketplaceSettings.logo_path)[0]}`;
          }

          req.logoFilePath = logoFilePath;

          callback(null);
        },
      );
    },
    // get product categories
    (callback) => {
      pool.query(
        `
          SELECT * FROM product_categories
          WHERE account_id = ?
          AND is_deleted = 0
        `,
        [req.account.id],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            res.status(500).json({ error: 'sql error', errorId: 3 });

            return;
          }

          req.categories = mysqlReply.map((category, index) => {
            let options = JSON.parse(category.options);
            const categorySlug = category.field.toLowerCase().replace(/ /g, '-');

            if (Array.isArray(options) && options.length > 0) {
              options = options.map(option => ({
                id: option.id,
                label: option.value,
                link: `/category/${categorySlug}/${option.value.toLowerCase().replace(/ /g, '-')}`,
              }));
            }

            return {
              id: index + 1,
              categoryName: category.field,
              categoryLink: `/category/${categorySlug}`,
              categorySlug,
              options,
              hasOptions: options.length > 0,
            };
          });

          callback(null);
        },
      );
    },
  ], (error) => {
    if (error) {
      res.status(error.status).send({ error });

      return;
    }

    next();
  });
}

export default fetchBestProductsAndCategory;
