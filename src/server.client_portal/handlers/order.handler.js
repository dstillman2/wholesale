import async from 'async';
import pool from '../config/mysql.config';
import schemas from '../schemas';
import query from '../sql_queries';
import tasks from '../tasks';

const orderHandler = {
  get(req, res) {
    const accountId = req.user.accountId;
    const orderId = req.params.orderId;

    const parameters = {
      limit: req.query.max || 10,
      offset: req.query.offset || 0,
      column: req.query.column,
      direction: req.query.direction,
      search: req.query.search,
      searchColumns: ['company', 'first_name', 'last_name', 'id'],
    };

    async.waterfall([
      // check permissions
      (callback) => {
        if (!req.permissions.read.orders) {
          callback({ message: 'forbidden', status: 403 });
        } else {
          callback(null);
        }
      },
      // get total count
      (callback) => {
        if (orderId) {
          callback(null, 1);
        } else {
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
        }
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
      // get products only if orderId is specified
      (orders, callback) => {
        if (!orderId) {
          callback(null, orders);
        } else {
          pool.query(
            `
              SELECT * FROM order_items
              WHERE order_id = ?
              AND is_deleted = 0
            `,
            orderId,
            (mysqlError, mysqlReply) => {
              const items = schemas.OrderItems(mysqlReply);

              const output = Object.assign({}, orders);
              output.data[0].items = items;

              if (mysqlError) {
                callback({ message: 'sql db error', status: 500, loc: 2, error: mysqlError });
              } else {
                callback(null, output);
              }
            },
          );
        }
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
    const orderId = req.params.orderId;
    const accountId = req.user.accountId;
    const items = JSON.parse(req.body.items);

    pool.getConnection((error, connection) => {
      if (error) {
        res.status(500).end();

        return;
      }

      async.waterfall([
        // check permissions
        (callback) => {
          if (!req.permissions.write.orders) {
            callback({ message: 'forbidden', status: 403 });
          } else {
            callback(null);
          }
        },
        (callback) => {
          const priceSubTotal = items.reduce((a, b) => a + (b.price * b.quantity), 0);
          const priceDeliveryFee = 0;
          const pricePaymentMarkup = 0;
          const priceTotal = priceSubTotal + priceDeliveryFee;
          const amountPaid = 0;

          const params = {
            account_id: accountId,
            amount_paid: amountPaid,
            price_sub_total: priceSubTotal,
            price_payment_markup: pricePaymentMarkup,
            price_delivery_fee: priceDeliveryFee,
            price_discount_percentage: null,
            price_discount_fixed: null,
            price_total: priceTotal,
            updated_at: new Date(),
          };

          connection.beginTransaction((transactError) => {
            if (transactError) {
              callback({ status: 500, data: { error: 'transact error' } });

              return;
            }

            const data = schemas.Orders(req.body).data;

            delete data.id;
            delete data.created_at;

            connection.query(
              `
                UPDATE orders
                SET ?
                WHERE id = ?
              `,
              [Object.assign({}, data, params), orderId],
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError, code: 150 } });
                } else {
                  callback(null);
                }
              },
            );
          });
        },
        // fetch existing order items
        (callback) => {
          connection.query(
            `
              SELECT * FROM order_items
              WHERE order_id = ?
              AND is_deleted = 0
            `,
            orderId,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError, code: 155 } });
              } else {
                callback(null, mysqlReply);
              }
            },
          );
        },
        // revert inventory count
        (orderItems, callback) => {
          async.eachSeries(orderItems, (orderItem, eachSeriesCallback) => {
            if (!orderItem.product_id) {
              eachSeriesCallback(null);

              return;
            }

            connection.query(
              `
                UPDATE products
                SET inventory = inventory + ?
                WHERE id = ?
              `,
              [orderItem.quantity, orderItem.product_id],
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError } });
                } else {
                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              callback(null);
            }
          });
        },
        // remove existing order items
        (callback) => {
          connection.query(
            `
              UPDATE order_items
              SET is_deleted = 1
              WHERE order_id = ?
            `,
            orderId,
            (mysqlError) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: 'order items removal' } });
              } else {
                callback(null);
              }
            },
          );
        },
        // update inventory count
        (callback) => {
          async.eachSeries(items, (item, eachSeriesCallback) => {
            if (!item.product_id) {
              eachSeriesCallback(null);

              return;
            }

            connection.query(
              `
                UPDATE products
                SET inventory = inventory - ?
                WHERE id = ?
              `,
              [item.quantity || 1, item.product_id],
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError } });
                } else {
                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              callback(null);
            }
          });
        },
        // create new order items
        (callback) => {
          async.eachSeries(items, (item, eachSeriesCallback) => {
            connection.query(
              `
                INSERT INTO order_items SET ?
              `,
              {
                order_id: orderId,
                account_id: accountId,
                product_id: item.product_id,
                customer_id: req.body.customer_id || null,
                price: item.price,
                name: item.name,
                quantity: item.quantity || 1,
                discount: item.discount || 0,
                created_at: new Date(),
              },
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError } });
                } else {
                  tasks.updateProducts({ accountId, productId: item.product_id }, 3000);

                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              connection.commit((commitError) => {
                if (commitError) {
                  callback({ status: 500, data: { error: 'rollback' } });
                } else {
                  connection.release();

                  callback(null);
                }
              });
            }
          });
        },
      ], (updateError) => {
        if (updateError) {
          connection.rollback(() => {
            res.status(updateError.status).json(updateError);
          });

          return;
        }

        res.json({ message: 'success' });

        tasks.updateCustomers({
          accountId,
          customerId: req.body.customer_id,
        }, 3000);
        tasks.createActivity({
          accountId,
          userId: req.user.id,
          action: 'orders.update',
          data: null,
        });
      });
    });
  },

  post(req, res) {
    const accountId = req.user.accountId;

    pool.getConnection((error, connection) => {
      if (error) {
        res.status(500).json({ error: 'connection error' });

        return;
      }

      async.waterfall([
        (callback) => {
          const items = JSON.parse(req.body.items);

          const priceSubTotal = items.reduce((a, b) => a + (b.price * b.quantity), 0);
          const priceDeliveryFee = 0;
          const pricePaymentMarkup = 0;
          const priceTotal = priceSubTotal + priceDeliveryFee;
          const amountPaid = 0;

          const params = {
            account_id: accountId,
            amount_paid: amountPaid,
            price_sub_total: priceSubTotal,
            price_payment_markup: pricePaymentMarkup,
            price_delivery_fee: priceDeliveryFee,
            price_discount_percentage: null,
            price_discount_fixed: null,
            price_total: priceTotal,
            order_status: typeof order_status === 'boolean' ? req.body.order_status : (amountPaid === priceTotal ? 'paid' : 'unpaid'),
            created_at: new Date(),
          };

          connection.beginTransaction((transactError) => {
            if (transactError) {
              callback({ status: 500, data: { error: 'transact error' } });

              return;
            }

            const data = schemas.Orders(req.body).data;

            delete data.id;

            connection.query(
              `
                INSERT INTO orders SET ?
              `,
              Object.assign({}, data, params),
              (mysqlError, mysqlReply) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError, code: 151 } });
                } else {
                  const orderId = mysqlReply.insertId;

                  callback(null, items, orderId);
                }
              },
            );
          });
        },
        (items, orderId, callback) => {
          async.eachSeries(items, (item, eachSeriesCallback) => {
            connection.query(
              `
                INSERT INTO order_items
                SET ?
              `,
              {
                account_id: req.account.id,
                customer_id: req.body.customer_id || null,
                product_id: item.product_id,
                order_id: orderId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                discount: 0,
              },
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError, code: 152 } });
                } else {
                  tasks.updateProducts({ accountId, productId: item.product_id }, 3000);

                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              callback(null, items);
            }
          },
        );
        },
        (items, callback) => {
          async.eachSeries(items, (item, eachSeriesCallback) => {
            connection.query(
              `
                UPDATE products
                SET inventory = inventory - ?
                WHERE id = ?
                AND account_id = ?
                AND is_deleted = 0
              `,
              [item.quantity, item.product_id, accountId],
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError, code: 153 } });
                } else {
                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              callback(null);
            }
          },
        );
        },
      ], (waterfallError) => {
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

              tasks.updateCustomers({
                accountId: req.account.id,
                customerId: req.body.customer_id,
              });
              tasks.createActivity({
                accountId,
                userId: req.user.id,
                action: 'orders.create',
                data: JSON.stringify(req.body),
              });
            }
          });
        }
      });
    });
  },

  delete(req, res) {
    const accountId = req.account.id;
    const orderId = req.params.orderId;

    if (!orderId) {
      res.status(400).end();

      return;
    }

    pool.getConnection((error, connection) => {
      if (error) {
        res.status(500).end();

        return;
      }

      async.waterfall([
        // check permissions
        (callback) => {
          if (!req.permissions.write.orders) {
            callback({ message: 'forbidden', status: 403 });
          } else {
            callback(null);
          }
        },
        (callback) => {
          connection.query(
            `
              UPDATE orders
              SET is_deleted = 1
              WHERE id = ?
              AND is_deleted = 0
            `,
            orderId,
            (mysqlError, results) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else if (results.changedRows !== 1) {
                callback({ status: 500, data: { error: 'invalid id' } });
              } else {
                callback(null);
              }
            },
          );
        },
        // fetch existing order items
        (callback) => {
          connection.query(
            `
              SELECT * FROM order_items
              WHERE order_id = ?
              AND is_deleted = 0
            `,
            orderId,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError, code: 155 } });
              } else {
                callback(null, mysqlReply);
              }
            },
          );
        },
        // revert inventory count
        (orderItems, callback) => {
          async.eachSeries(orderItems, (orderItem, eachSeriesCallback) => {
            if (!orderItem.product_id) {
              eachSeriesCallback(null);

              return;
            }

            connection.query(
              `
                UPDATE products
                SET inventory = inventory + ?
                WHERE id = ?
              `,
              [orderItem.quantity, orderItem.product_id],
              (mysqlError) => {
                if (mysqlError) {
                  callback({ status: 500, data: { error: mysqlError } });
                } else {
                  eachSeriesCallback(null);
                }
              },
            );
          }, (eachSeriesError) => {
            if (eachSeriesError) {
              callback({ status: 500, data: { error: 'rollback' } });
            } else {
              callback(null);
            }
          });
        },
        // delete all order items
        (callback) => {
          connection.query(
            `
              UPDATE order_items
              SET is_deleted = 1
              WHERE order_id = ?
              AND is_deleted = 0
            `,
            orderId,
            (mysqlError) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null);
              }
            },
          );
        },
        (callback) => {
          connection.query(
            `
              SELECT * FROM orders
              WHERE id = ?
            `,
            orderId,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                callback(null, mysqlReply[0]);
              }
            },
          );
        },
        (order, callback) => {
          connection.query(
            `
              SELECT * FROM order_items
              WHERE order_id = ?
            `,
            orderId,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, data: { error: mysqlError } });
              } else {
                order.items = mysqlReply;

                callback(null, order);
              }
            },
          );
        },
      ], (waterfallError, output) => {
        if (waterfallError) {
          connection.rollback(() => {
            res.status(waterfallError.status).send({ error: waterfallError });
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

              if (Array.isArray(output.items)) {
                output.items.forEach((item) => {
                  tasks.updateProducts({ accountId, productId: item.product_id }, 3000);
                });
              }

              tasks.updateCustomers({ accountId, customerId: output.customer_id }, 3000);
              tasks.createActivity({
                accountId,
                userId: req.user.id,
                action: 'orders.delete',
                data: JSON.stringify(output),
              });
            }
          });
        }
      });
    });
  },
};

export default orderHandler;
