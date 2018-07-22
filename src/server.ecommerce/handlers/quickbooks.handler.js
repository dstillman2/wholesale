import async from 'async';
import pool from '../config/mysql.config';
import numberWithCommas from '../js/func/comma_separate_number';

const categoryHandler = {
  get(req, res) {
    const accountId = req.account.id;
    const categoryName = req.params.categoryName.replace(/-/g, ' ');
    const subCategoryName = req.params.subCategoryName;

    async.waterfall([
      // get category id from category name
      (callback) => {
        pool.query(
          `
            SELECT * FROM product_categories
            WHERE account_id = ?
            AND field = ?
            AND is_deleted = 0
            LIMIT 1
          `,
          [accountId, categoryName],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ error: mysqlError });
            } else {
              callback(null, mysqlReply[0].id, mysqlReply[0]);
            }
          },
        );
      },
      (categoryId, category, callback) => {
        pool.query(
          `
            SELECT * FROM products
            WHERE account_id = ?
            AND is_deleted = 0
          `,
          [accountId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ error: mysqlError });

              return;
            }

            function getName(id) {
              const test = JSON.parse(category.options).reduce((a, b) => {
                if (b.id === id) {
                  return b.value.toLowerCase();
                }

                return a;
              }, null);

              return test;
            }

            const products = mysqlReply.filter((product) => {
              const isOfCategory = JSON.parse(product.categories).reduce((a, b) => {
                if (a) {
                  return a;
                } else if (
                  b.id === categoryId &&
                  b.value &&
                  (!subCategoryName || (
                    getName(b.subCategory) === subCategoryName.replace(/-/g, ' ').toLowerCase()
                  ))) {
                  return true;
                }

                return false;
              }, false);

              const hasNoInventory = (
                product.hasInventoryTracking &&
                !product.isSellingOOS &&
                product.inventory <= 0
              );

              if (isOfCategory && !hasNoInventory) {
                return true;
              }

              return false;
            });

            callback(null, products);
          },
        );
      },
    ], (error, output) => {
      if (error) {
        res.render('default/category', {
          pageInfo: req.pageInfo,
          account: req.account,
          isLoggedIn: req.isAuthenticated,
          categories: req.categories,
          bestSellers: req.bestSellers,
          hasCategory: error.loc !== 2,
          hasProducts: error.loc === 2,
          pageTitle: 'Category Error',
        });
      } else {
        res.render('default/category', {
          pageTitle: `${subCategoryName || categoryName} (${output.length === 1 ? '1 Product' : `${output.length} products`})`,
          pageInfo: req.pageInfo,
          account: req.account,
          isLoggedIn: req.isAuthenticated,
          logoFilePath: req.logoFilePath,
          categories: req.categories,
          bestSellers: req.bestSellers,
          products: output.map((product) => {
            let primaryImage;

            if (
              Array.isArray(JSON.parse(product.image_uploads))
              && JSON.parse(product.image_uploads).length > 0
            ) {
              primaryImage = `/images/${JSON.parse(product.image_uploads)[0]}`;
            }

            return {
              id: product.id,
              name: product.name,
              primaryImage,
              price: numberWithCommas((product.price / 100).toFixed(2)),
            };
          }),
          hasProducts: output.length > 0,
          hasCategory: true,
          categoryName,
          subCategoryName: subCategoryName && subCategoryName.replace(/-/g, ' '),
          isDemo: process.env.NODE_ENV !== 'production',
        });
      }
    });
  },
};

export default categoryHandler;
