import async from 'async';
import pool from '../config/mysql.config';
import schemas from '../schemas';

const marketplaceHandler = {
  get(req, res) {
    const accountId = req.user.accountId;

    async.waterfall([
      (callback) => {
        pool.query(
          `
            SELECT * FROM marketplace_settings
            WHERE account_id = ?
          `,
          accountId,
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, error: 'sql error' });

              return;
            }

            if (mysqlReply.length !== 1) {
              callback({ status: 500, error: 'account config error' });

              return;
            }

            callback(null, mysqlReply[0]);
          },
        );
      },
      (marketplaceSettings, callback) => {
        const settings = {
          payments_stripe_secret_key: marketplaceSettings.payments_stripe_secret_key ? '***********' : null,
          sendgrid_api_key: marketplaceSettings.sendgrid_api_key ? '************' : null,
        };

        pool.query(
          `
            SELECT * FROM product_categories
            WHERE account_id = ?
            AND is_deleted = 0
          `,
          accountId,
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, error: 'sql error' });

              return;
            }

            const output = Object.assign({}, marketplaceSettings, settings, {
              categories: schemas.ProductCategories(mysqlReply),
            });

            callback(null, schemas.Marketplace(output));
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
    const accountId = req.user.accountId;

    const bodyData = schemas.Marketplace(req.body).data;
    const output = {};

    Object.keys(bodyData).forEach((item) => {
      if (bodyData[item] !== null && !/^\*+$/.test(bodyData[item])) {
        output[item] = bodyData[item];
      }
    });

    pool.query(
      `
        UPDATE marketplace_settings
        SET ?
        WHERE account_id = ?
      `,
      [output, accountId],
      (mysqlError) => {
        if (mysqlError) {
          res.status(500).json({ error: 'sql error' });
        } else {
          res.send('success');
        }
      },
    );
  },
};

export default marketplaceHandler;
