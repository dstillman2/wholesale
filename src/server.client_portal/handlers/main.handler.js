import mysql from '../config/mysql.config';
import schemas from '../schemas';
import { NODE_ENV } from '../options';

const mainHandler = {
  get(req, res) {
    mysql.query(
      `
        SELECT * FROM product_categories
        WHERE account_id=${req.user.accountId} AND is_deleted=0
      `,
      (mysqlError, mysqlReply) => {
        if (mysqlError) {
          res.status(404).end();

          return;
        }

        res.render('index', Object.assign(
          {
            permissions: req.user.permissions,
            productCategories: JSON.stringify((schemas.ProductCategories(mysqlReply))),
            flags: req.account.flags || '[]',
            firstName: req.user.first_name,
            lastname: req.user.last_name,
            name: `${req.user.first_name[0]}. ${req.user.last_name}` || '',
            isProduction: NODE_ENV === 'production',
            csrfToken: req.csrfToken,
          },
        ));
      },
    );
  },
};

export default mainHandler;
