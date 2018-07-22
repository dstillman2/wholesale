import async from 'async';
import stripe from 'stripe';
import sendgrid from 'sendgrid';
import moment from 'moment';
import pool from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';
import tasks from '../tasks';
import { SENDGRID_API_KEY } from '../options';

const orderHandler = {
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
      // get orders
      (callback) => {
        pool.query(
          query.getEntries(accountId, 'orders', orderId, parameters),
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
            } else {
              callback(null, schemas.Orders(mysqlReply, 1));
            }
          },
        );
      },
      // get order items
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
              callback({ message: 'sql db error', status: 500, loc: 3, error: mysqlError });
            } else {
              callback(null, order, mysqlReply);
            }
          },
        );
      },
    ], (error, order, orderItems) => {
      if (error) {
        res.status(error.status).json({ error });
      } else {
        const data = order.data[0] || {};

        res.render('default/order_details', {
          pageInfo: req.pageInfo,
          account: req.account,
          customer: req.customer,
          categories: req.categories,
          logoFilePath: req.logoFilePath,
          isLoggedIn: true,
          data: {
            orderId: data.id,
            payment_type: data.payment_type,
            shipping_line_1: `${data.shipping_address_1} ${data.shipping_address_2}`,
            shipping_line_2: `${data.shipping_city}, ${data.shipping_state} ${data.shipping_zip_code}`,
            email_address: data.email_address,
            phone_number: data.phone_number,
            created_at: moment(data.created_at).format('LL'),
            price: `$${Number((data.price_total / 100).toFixed(2)).toLocaleString()}`,
          },
          orderItems: orderItems.map(item => ({
            productId: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: `$${Number((item.price / 100).toFixed(2)).toLocaleString()}`,
          })),
          isDemo: process.env.NODE_ENV !== 'production',
        });
      }
    });
  },

  post(req, res) {
    const accountId = req.account.id;

    pool.getConnection((error, connection) => {
      if (error) {
        res.status(500).json({ error: 'connection error' });

        return;
      }

      async.waterfall([
        // Grab all products from items in data obj. Get actual prices in case
        // of tampering of localStorage.
        (callback) => {
          const items = JSON.parse(req.body.items);

          pool.query(
              `
                SELECT * FROM products
                WHERE id IN (${items.map(item => item.id)})
                AND account_id = ?
                AND is_active_marketplace = 1
                AND is_deleted = 0
              `
            ,
            [accountId],
            (mysqlError, results) => {
              if (mysqlError) {
                callback({ status: 500, data: { error, code: 150 } });
              } else {
                let formattedItems = [];

                items.forEach((item) => {
                  for (let i = 0; i < results.length; i += 1) {
                    if (results[i].id === item.id) {
                      const result = results[i];

                      formattedItems = formattedItems.concat(
                        {
                          id: result.id,
                          price: result.price,
                          name: result.name,
                          quantity: Number(item.quantity) || 1,
                          productSpecs: {
                            inventory: result.inventory,
                            hasInventoryTracking: result.hasInventoryTracking,
                            isSellingOOS: result.isSellingOOS,
                          },
                        },
                      );
                    }
                  }
                });

                callback(null, formattedItems);
              }
            },
          );
        },
        // validate inventory
        (formattedItems, callback) => {
          const items = [];


          formattedItems.forEach((item) => {
            if (
              item.productSpecs.hasInventoryTracking &&
              !item.productSpecs.isSellingOOS &&
              item.productSpecs.inventory - item.quantity < 0
            ) {
              items.push(item);
            }
          });

          if (items.length > 0) {
            let errorMessage = '';

            items.forEach((item) => {
              errorMessage += (
                `${item.name} is out of stock (max purchase count: ${item.productSpecs.inventory > 0 ? item.productSpecs.inventory : '0'}). `
              );
            });

            callback({ status: 400, data: { error: errorMessage, code: 509 } });
          } else {
            callback(null, formattedItems);
          }
        },
        // update product Inventory
        (formattedItems, callback) => {
          connection.beginTransaction((transactError) => {
            if (transactError) {
              callback({ status: 500, data: { error: 'transact error' } });

              return;
            }

            async.eachSeries(formattedItems, (item, eachSeriesCallback) => {
              connection.query(
                `
                  UPDATE products
                  SET inventory = inventory - ?
                  WHERE id = ?
                  AND account_id = ?
                  AND is_deleted = 0
                `,
                [item.quantity, item.id, accountId],
                (mysqlError) => {
                  if (mysqlError) {
                    eachSeriesCallback({ status: 500, data: { error: mysqlError } });
                  } else {
                    eachSeriesCallback(null, formattedItems);
                  }
                },
              );
            }, (eachSeriesError) => {
              if (eachSeriesError) {
                callback(eachSeriesError);
              } else {
                callback(null, formattedItems);
              }
            });
          });
        },
        // Calculate price total, start transaction and place order data into sql
        (formattedItems, callback) => {
          const paymentMarkup = req.marketplaceSettings.payments_credit_card_markup;
          const priceSubTotal = formattedItems.reduce((a, b) => a + (b.price * b.quantity), 0);
          const priceDeliveryFee = 0;
          const pricePaymentMarkup = req.body.payment_type === 'cash' ? 0 : (
            Number(((paymentMarkup / 100) * priceSubTotal).toFixed(0))
          );
          const priceTotal = (
              priceSubTotal
            + priceDeliveryFee
            + pricePaymentMarkup
          );
          let amountPaid = 0;

          if (priceTotal !== Number(req.body.displayed_total)) {
            callback({ status: 500, data: { error: 'data tampering' } });
            return;
          }

          if (['bitcoin', 'credit_card'].indexOf(req.body.payment_type) > -1) {
            amountPaid = priceTotal;
          }

          const params = {
            account_id: req.account.id,
            customer_id: req.customer.id,
            company: req.body.company,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            shipping_address_1: req.body.shipping_address_1,
            shipping_address_2: req.body.shipping_address_2,
            shipping_city: req.body.shipping_city,
            shipping_state: req.body.shipping_state,
            shipping_zip_code: req.body.shipping_zip_code,
            email_address: req.body.email_address,
            phone_number: req.body.phone_number,
            payment_type: req.body.payment_type,
            stripe_token_id: req.body.payment_type === 'cash' ? null : JSON.parse(req.body.stripe_token_object).id,
            amount_paid: amountPaid,
            price_sub_total: priceSubTotal,
            price_payment_markup: pricePaymentMarkup,
            price_delivery_fee: priceDeliveryFee,
            price_discount_percentage: null,
            price_discount_fixed: null,
            price_total: priceTotal,
            order_status: amountPaid === priceTotal ? 'paid' : 'unpaid',
            created_at: new Date(),
          };

          connection.query(
            `
              INSERT INTO orders SET ?
            `,
            params,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError, code: 150 } });
              } else {
                const orderId = mysqlReply.insertId;

                callback(null, formattedItems, orderId, priceTotal);
              }
            },
          );
        },
        // purchased items are added to order_items table
        (formattedItems, orderId, priceTotal, callback) => {
          async.eachSeries(formattedItems, (item, eachSeriesCallback) => {
            connection.query(
              `
                INSERT INTO order_items
                SET ?
              `,
              {
                account_id: req.account.id,
                customer_id: req.customer.id,
                product_id: item.id,
                order_id: orderId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                discount: 0,
                created_at: new Date(),
              },
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError, code: 151 } });
                } else {
                  tasks.updateProducts({
                    accountId: req.account.id,
                    productId: item.id,
                  }, 3000);

                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              callback(null, orderId, priceTotal);
            }
          },
        );
        },
        // create a charge
        (orderId, priceTotal, callback) => {
          const paymentType = req.body.payment_type;
          const stripeSecretKey = req.marketplaceSettings.payments_stripe_secret_key;

          if (paymentType === 'credit_card' || paymentType === 'bitcoin') {
            stripe(stripeSecretKey).charges.create({
              amount: priceTotal,
              currency: 'usd',
              description: `Order ID #${orderId}`,
              source: JSON.parse(req.body.stripe_token_object).id,
            }, (stripeError) => {
              if (stripeError) {
                callback({ status: 500, data: { error: 'stripe charge' } });
              } else {
                callback(null, orderId);
              }
            });
          } else {
            callback(null, orderId);
          }
        },
      ], (waterfallError, orderId) => {
        if (waterfallError) {
          connection.rollback(() => {
            res.status(waterfallError.status).send(waterfallError);
          });
        } else {
          connection.commit((commitError) => {
            if (commitError) {
              connection.rollback(() => {
                res.status(500).send({ error: commitError });
              });
            } else {
              connection.release();

              res.json({ data: 'success' });

              const sg = sendgrid(req.marketplaceSettings.sendgrid_api_key || SENDGRID_API_KEY);

              const request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: {
                  personalizations: [
                    {
                      to: [
                        {
                          email: req.body.email_address,
                        },
                      ],
                      subject: `Order Confirmation #${orderId}`,
                    },
                  ],
                  from: {
                    email: req.marketplaceSettings.automated_email,
                  },
                  content: [
                    {
                      type: 'text/html',
                      value: req.marketplaceSettings.order_confirmation_email.replace('{{orderId}}', orderId),
                    },
                  ],
                },
              });

              sg.API(request);

              tasks.updateCustomers({
                accountId: req.account.id,
                customerId: req.customer.id,
              });
              tasks.createActivity({
                accountId: req.account.id,
                userId: req.customer.id,
                action: 'orders.create',
                data: JSON.stringify({ orderId }),
              });
            }
          });
        }
      });
    });
  },
};

export default orderHandler;
