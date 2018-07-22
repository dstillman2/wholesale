import async from 'async';
import bcrypt from 'bcryptjs';
import hat from 'hat';
import schemas from '../schemas';
import pool from '../config/mysql.config';
import validateFields from '../validations';

const createAccountHandler = {
  post(req, res) {
    pool.getConnection((connectionError, connection) => {
      if (connectionError) {
        res.status(500).end();

        return;
      }

      async.waterfall([
        // validate fields
        (callback) => {
          validateFields('accounts', req.body, (error, params) => {
            if (error) {
              callback({ status: 400, error });

              return;
            }

            callback(null, params);
          });
        },
        // check if username already exists
        (params, callback) => {
          connection.beginTransaction((transactError) => {
            if (transactError) {
              callback({ status: 500, data: { error: 'transact error' } });

              return;
            }

            connection.query(
              `
                SELECT * FROM users
                WHERE email_address=? AND is_deleted=0
              `,
              params.email_address,
              (mysqlError, mysqlReply) => {
                if (mysqlError) {
                  callback({ status: 500, data: { message: 'sql db error', code: 419 } });

                  return;
                }

                if (mysqlReply.length !== 0) {
                  callback({ status: 400, data: { message: 'email address taken', code: 275 } });
                } else {
                  callback(null, params);
                }
              },
            );
          });
        },
        // generate salt
        (params, callback) => {
          bcrypt.genSalt(10, (saltGenError, salt) => {
            if (saltGenError) {
              callback({ status: 500, data: { error: saltGenError } });
            } else {
              callback(null, params, salt);
            }
          });
        },
        // generate password
        (params, salt, callback) => {
          bcrypt.hash(params.password, salt, (hashError, hashedPassword) => {
            if (hashError) {
              callback({ status: 500, data: { error: hashError } });

              return;
            }

            callback(null, Object.assign({}, params, { password: hashedPassword }));
          });
        },
        // create new accounts entry
        (params, callback) => {
          connection.query(
            `
              INSERT INTO accounts SET ?
            `,
            {
              company: params.company,
              address_1: params.address_1,
              address_2: params.address_2,
              city: params.city,
              state: params.state,
              zip_code: params.zip_code,
              subdomain: hat.rack()().slice(0, 6),
              api_key: hat.rack()(),
              created_at: new Date(),
            },
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null, params, mysqlReply.insertId);
              }
            },
          );
        },
        // create new users entry
        (params, accountId, callback) => {
          connection.query(
            `
              INSERT INTO users SET ?
            `,
            {
              first_name: params.first_name,
              last_name: params.last_name,
              account_id: accountId,
              email_address: params.email_address,
              password: params.password,
              permissions: JSON.stringify({
                read: { orders: true, customers: true, products: true },
                write: { orders: true, customers: true, products: true },
                isAdministrator: true,
              }),
              created_at: new Date(),
            },
            (mysqlError) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null, params, accountId);
              }
            },
          );
        },
        // create marketplace settings entry
        (params, accountId, callback) => {
          connection.query(
            `
              INSERT INTO marketplace_settings SET ?
            `,
            {
              account_id: accountId,
              automated_email: 'noreply@ordernimbus.com',
              contact_form_email: params.email_address,
              order_confirmation_email: 'Thank you for your order; we are currently reviewing your request.<br/><br/>Your order confirmation number is <b>{{orderId}}</b>.',
              created_at: new Date(),
            },
            (mysqlError) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null, params);
              }
            },
          );
        },
      ], (error, output) => {
        if (error) {
          connection.rollback(() => {
            res.status(error.status).json(error);
          });
        } else {
          connection.commit((commitError) => {
            if (commitError) {
              res.status(500).end();
            } else {
              res.json(schemas.Accounts(output));
            }
          });
        }
      });
    });
  },
};

export default createAccountHandler;
