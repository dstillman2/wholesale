import fs from 'fs';
import path from 'path';

import async from 'async';
import moment from 'moment';
import pdf from 'html-pdf';
import Mustache from 'mustache';
import schemas from '../schemas';
import pool from '../config/mysql.config';

const invoiceHandler = {
  get(req, res) {
    const accountId = req.account.id;
    const orderId = req.params.orderId;

    async.waterfall([
      (callback) => {
        pool.query(
          `
            SELECT * FROM orders
            WHERE account_id = ?
            AND id = ?
            AND is_deleted = 0
          `,
          [accountId, orderId],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              res.status(500).end();

              return;
            }

            const order = mysqlReply[0];

            callback(null, order);
          },
        );
      },
      (order, callback) => {
        pool.query(
          `
            SELECT * FROM order_items
            WHERE order_id = ?
            AND is_deleted = 0
          `,
          orderId,
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ status: 500, error: mysqlError });
            } else {
              const orderItems = schemas.OrderItems(mysqlReply).data.map(item => ({
                price: (item.price * item.quantity / 100).toFixed(2),
                quantity: item.quantity,
                name: item.name,
              }));

              callback(null, order, orderItems);
            }
          },
        );
      },
    ], (waterfallError, order, orderItems) => {
      if (waterfallError) {
        res.status(waterfallError.status).json({ error: waterfallError });
      } else {
        const template = fs.readFileSync(
          path.join(__dirname, '../views', 'invoices', 'invoice_v1.mustache'),
          'utf8',
        );

        const renderedTemplate = Mustache.render(template, Object.assign({},
          {
            account: req.account,
            order,
            orderItems,
            orderStatus: order.order_status === 'unpaid' ? 'unpaid' : 'paid',
            subTotal: (order.price_sub_total / 100).toFixed(2),
            total: (order.price_total / 100).toFixed(2),
            deliveryFee: (order.price_delivery_fee / 100).toFixed(2),
            hasDiscount: !!order.price_discount,
            discount: (order.price_discount / 100).toFixed(2),
            date: moment(order.created_at).format('LL'),
          },
        ));

        const options = {
          format: 'Letter',
        };

        pdf.create(renderedTemplate, options).toBuffer((error, pdfOutput) => {
          if (error) {
            res.status(500).send(
              'Error generating invoice. Please contact support.',
            );
          } else {
            res.send(pdfOutput);
          }
        });
      }
    });
  },
};

export default invoiceHandler;
