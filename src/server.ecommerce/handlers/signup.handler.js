import async from 'async';
import bcrypt from 'bcryptjs';
import formidable from 'formidable';
import mysql from '../config/mysql.config';

const signupHandler = {
  get(req, res) {
    if (typeof req.userData === 'object') {
      res.redirect('/account');
    } else {
      res.render('default/sign_up', {
        pageInfo: req.pageInfo,
        logoFilePath: req.logoFilePath,
        account: req.account,
        categories: req.categories,
        isDemo: process.env.NODE_ENV !== 'production',
      });
    }
  },

  post(req, res) {
    async.waterfall([
      (callback) => {
        const form = new formidable.IncomingForm();

        form.encoding = 'utf-8';

        form.parse(req, (error, fields) => {
          if (error) {
            callback({ status: 500, data: { message: 'form parse error', code: 100594 } });

            return;
          }

          callback(null, fields);
        });
      },
      // check if customer already exists
      (params, callback) => {
        mysql.query(
          `
            SELECT * FROM customers
            WHERE email_address = ?
            AND account_id = ?
            AND is_deleted = 0
          `,
          [params.email_address, req.account.id],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { message: 'sql db error', code: 100595 } });

              return;
            }

            if (mysqlReply.length !== 0) {
              callback({ status: 400, data: { message: 'email address taken', code: 100596 } });
            } else {
              callback(null, params);
            }
          },
        );
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
        const output = {
          account_id: req.account.id,

          email_address: params.email_address,
          password: params.password,

          company: params.company,
          first_name: params.first_name,
          last_name: params.last_name,
          phone_number: params.phone_number,

          address_1: params.address_1,
          address_2: params.address_2,
          city: params.city,
          state: params.state,
          zip_code: params.zip_code,

          EIN: params.EIN,

          created_at: new Date(),
        };

        // param validation
        const requiredParams = ['email_address', 'password', 'company', 'first_name', 'last_name', 'phone_number', 'address_1', 'city', 'state', 'zip_code'];
        const failedFields = [];

        Object.keys(output).forEach((key) => {
          if (requiredParams.indexOf(key) > -1 && !output[key]) {
            failedFields.push(key);
          }
        });

        if (failedFields.length > 0) {
          callback({ status: 400, data: { error: `The following fields are required: ${failedFields.join(', ')}`, code: 100597 } });

          return;
        }

        mysql.query(
          `
            INSERT INTO customers SET ?
          `,
          output,
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, data: { error: mysqlError } });
            } else {
              callback(null, params, mysqlReply.insertId);
            }
          },
        );
      },
    ], (error) => {
      if (error) {
        res.status(error.status).json({ error });
      } else {
        res.end();
      }
    });
  },
};

export default signupHandler;
