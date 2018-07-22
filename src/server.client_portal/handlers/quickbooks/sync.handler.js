import async from 'async';
import request from 'request';
import ClientOAuth2 from 'client-oauth2';
import mysql from '../../config/mysql.config';
import getQbConfigs from '../../config/qb.config';

function generateUniqueId() {
  const allowableCharacters = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYX';
  let output = '';

  for (let i = 0; i < 7; i += 1) {
    output += allowableCharacters[Math.floor(Math.random() * 62)];
  }

  return output;
}

const getCustomerObject = (apiUri, qbData, qbRealmId, data, isUpdating, isDeleting = false) => {
  const obj = {
    url: `${apiUri}/${qbRealmId}/customer${isUpdating ? '?operation=update' : ''}`,
    headers: {
      Authorization: `Bearer ${qbData.accessToken}`,
      Accept: 'application/json',
    },
    body: {
      BillAddr: {
        Line1: `${data.address_1} ${data.address_2}`,
        City: data.city,
        CountrySubDivisionCode: data.state,
        PostalCode: data.zip_code,
      },
      GivenName: data.first_name.slice(0, 25),
      FamilyName: data.last_name.slice(0, 25),
      DisplayName: `${data.company} (${data.id}) - ${generateUniqueId()}`.slice(0, 100),
      CompanyName: data.company.slice(0, 50),
      Active: !isDeleting,
      PrimaryPhone: {
        FreeFormNumber: data.phone_number,
      },
      PrimaryEmailAddr: {
        Address: data.email_address,
      },
    },
    json: true,
  };

  if (isUpdating || isDeleting) {
    obj.body.Id = data.qb_id;
    obj.body.SyncToken = data.qb_sync_token;
  }

  return obj;
};

function logError(task, errorMessage) {
  let description = errorMessage;

  if (typeof errorMessage !== 'string') {
    description = JSON.stringify(errorMessage);
  }

  mysql.query(
    `
      INSERT INTO exceptions
      SET ?
    `,
    [{ task, description, created_at: new Date() }],
  );
}

function syncCustomers({ apiUri, accountId, isUpdating, isDeleting, qbSyncDate }, syncCustomerCallback) {
  async.waterfall([
    // get access token and refresh token
    (callback) => {
      mysql.query(
        `
          SELECT qb_token, qb_last_sync, qb_realm_id FROM accounts
          WHERE id = ?
          AND is_deleted = 0
        `,
        [accountId],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            logError('qb_sync.salesreceipt.query_token', mysqlError);
          } else {
            const results = mysqlReply[0];

            callback(
              null,
              JSON.parse(results.qb_token),
              results.qb_realm_id,
            );
          }
        },
      );
    },
    // get customers to create, update, or delete
    (qbTokens, qbRealmId, callback) => {
      let query = (
        `
          SELECT * FROM customers
          WHERE account_id = ?
          AND is_deleted = 0
          AND qb_id IS NULL
        `
      );

      if (isUpdating) {
        query = (
          `
            SELECT * FROM customers
            WHERE account_id = ?
            AND is_deleted = 0
            AND updated_at > ?
            AND qb_id IS NOT NULL
          `
        );
      }

      if (isDeleting) {
        query = (
          `
            SELECT * FROM customers
            WHERE account_id = ?
            AND is_deleted = 1
            AND qb_id IS NOT NULL
          `
        );
      }

      mysql.query(
        query,
        [accountId, qbSyncDate || 0],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            logError('qb_sync.customers.select', mysqlError);
          } else {
            callback(null, qbTokens, qbRealmId, mysqlReply);
          }
        },
      );
    },
    // sync customers
    (qbTokens, qbRealmId, data, callback) => {
      async.eachSeries(data, (customer, eachSeriesCallback) => {
        request.post(
          getCustomerObject(apiUri, qbTokens, qbRealmId, customer, isUpdating, isDeleting),
          (postError, qbResponse) => {
            if (postError) {
              logError('qb_sync.customers.post', postError);

              eachSeriesCallback(null);
            } else if (qbResponse.statusCode === 401) {
              // refresh the token and try again
              async.waterfall([
                (refreshTokenCallback) => {
                  getQbConfigs((qbConfigError, configs) => {
                    if (qbConfigError) {
                      logError('qb_sync.customers.qbconfig', qbConfigError);

                      eachSeriesCallback(null);
                    } else {
                      const intuitAuth = new ClientOAuth2(configs);

                      const token = intuitAuth.createToken(
                        qbTokens.accessToken,
                        qbTokens.refreshToken,
                        qbTokens.tokenType,
                        qbTokens.data,
                      );

                      refreshTokenCallback(null, token);
                    }
                  });
                },
                (token, refreshTokenCallback) => {
                  token.refresh().then((newToken) => {
                    const updatedQbTokens = {
                      accessToken: newToken.accessToken,
                      refreshToken: newToken.refreshToken,
                      tokenType: newToken.tokenType,
                      data: newToken.data,
                    };

                    refreshTokenCallback(null, updatedQbTokens);
                  }).catch((tokenRefreshError) => {
                    logError('qb_sync.customers.token_refresh', tokenRefreshError);

                    eachSeriesCallback(null);
                  });
                },
                (updatedQbTokens, refreshTokenCallback) => {
                  mysql.query(
                    `
                      UPDATE accounts
                      SET ?
                      WHERE id = ?
                    `,
                    [{ qb_token: JSON.stringify(updatedQbTokens) }, accountId],
                    (mysqlError) => {
                      if (mysqlError) {
                        logError('qb_sync.customers.update_accounts', mysqlError);

                        eachSeriesCallback(null);
                      } else {
                        refreshTokenCallback(null, updatedQbTokens);
                      }
                    },
                  );
                },
                (updatedQbTokens, refreshTokenCallback) => {
                  request.post(
                    getCustomerObject(apiUri, updatedQbTokens, qbRealmId, customer, isUpdating, isDeleting),
                    (error, response) => {
                      if (postError) {
                        logError('qb_sync.customers.post_error', postError);

                        eachSeriesCallback(null);
                      } else {
                        const body = response.body;

                        refreshTokenCallback(null, body);
                      }
                    },
                  );
                },
                (body, refreshTokenCallback) => {
                  if (!(body.Customer && body.Customer.Id)) {
                    logError('qb_sync.customers.body_error_1', body);

                    eachSeriesCallback(null);

                    return;
                  }

                  mysql.query(
                    `
                      UPDATE customers
                      SET ?
                      WHERE id = ?
                    `,
                    [
                      {
                        qb_id: isDeleting ? null : body.Customer.Id,
                        qb_sync_token: isDeleting ? null : body.Customer.SyncToken,
                      },
                      customer.id,
                    ],
                    (mysqlError) => {
                      if (mysqlError) {
                        logError('qb_sync.customers.update_customers_1', mysqlError);

                        eachSeriesCallback(null);
                      } else {
                        refreshTokenCallback(null);
                      }
                    },
                  );
                },
              ], (waterfallError) => {
                if (waterfallError) {
                  logError('qb_sync.customers.series_1', waterfallError);
                }

                eachSeriesCallback(null);
              });
            } else {
              const body = qbResponse.body;

              if (!(body.Customer && body.Customer.Id)) {
                logError('qb_sync.customers.body_error_2', body);

                eachSeriesCallback(null);

                return;
              }

              mysql.query(
                `
                  UPDATE customers
                  SET ?
                  WHERE id = ?
                `,
                [
                  {
                    qb_id: isDeleting ? null : body.Customer.Id,
                    qb_sync_token: isDeleting ? null : body.Customer.SyncToken,
                  },
                  customer.id,
                ],
                (mysqlError) => {
                  if (mysqlError) {
                    logError('qb_sync.customers.update_customers_2', mysqlError);
                  }

                  eachSeriesCallback(null);
                },
              );
            }
          });
      }, (eachSeriesError) => {
        if (eachSeriesError) {
          logError('qb_sync.customers.series_2', eachSeriesError);
        }

        callback(null);
      });
    },
  ], (waterfallError) => {
    if (waterfallError) {
      logError('qb_sync.customers.waterfall', waterfallError);
    }

    if (typeof callback === 'function') {
      syncCustomerCallback(null);
    }
  });
}

const getSalesReceiptObject = (apiUri, qbData, qbRealmId, order, isUpdating, isDeleting) => {
  let extension = '';

  if (isUpdating) {
    extension = '?operation=update';
  } else if (isDeleting) {
    extension = '?operation=delete';
  }

  const obj = {
    url: `${apiUri}/${qbRealmId}/salesreceipt${extension}`,
    headers: {
      Authorization: `Bearer ${qbData.accessToken}`,
      Accept: 'application/json',
    },
    body: {
      TxnDate: order.created_at,
      DocNumber: order.id,
      BillAddr: {
        Line1: order.shipping_address_1,
        Line2: order.shipping_address_2,
        City: order.shipping_city,
        CountrySubDivisionCode: order.shipping_state,
        PostalCode: order.shipping_zip_code,
      },
      Line: order.orderItems.map(orderItem => (
        {
          Description: orderItem.name,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            UnitPrice: Number((orderItem.price / 100).toFixed(2)),
            Qty: orderItem.quantity,
          },
          Amount: Number(((orderItem.quantity * orderItem.price) / 100).toFixed(2)),
        }
      )),
      CustomerRef: {
        value: order.customer_qb_id,
        name: `${order.first_name} ${order.last_name}`,
      },
      Balance: Number(((order.price_total - order.amount_paid) / 100).toFixed(2)),
    },
    json: true,
  };

  if (isUpdating || isDeleting) {
    obj.body.Id = order.qb_id;
    obj.body.SyncToken = order.qb_sync_token;
  }

  return obj;
};

function syncSalesReceipt(
  { apiUri, accountId, isUpdating, isDeleting, qbSyncDate },
  syncSalesReceiptCallback) {
  async.waterfall([
    // get access token and refresh token
    (callback) => {
      mysql.query(
        `
          SELECT qb_token, qb_realm_id FROM accounts
          WHERE id = ?
          AND is_deleted = 0
        `,
        [accountId],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            logError('qb_sync.salesreceipt.query_token', mysqlError);
          } else {
            const results = mysqlReply[0];

            callback(
              null,
              JSON.parse(results.qb_token),
              results.qb_realm_id,
            );
          }
        },
      );
    },
    // get orders to create
    (qbTokens, qbRealmId, callback) => {
      let query = (
        `
        SELECT orders.*, customers.qb_id as customer_qb_id FROM orders
        LEFT JOIN customers ON customers.id = orders.customer_id
        WHERE orders.account_id = ?
        AND orders.order_status = "paid"
        AND orders.is_deleted = 0
        AND orders.qb_id IS NULL
        `
      );

      if (isUpdating) {
        query = (
          `
            SELECT orders.*, customers.qb_id as customer_qb_id FROM orders
            LEFT JOIN customers ON customers.id = orders.customer_id
            WHERE orders.account_id = ?
            AND orders.is_deleted = 0
            AND orders.updated_at > ?
            AND orders.qb_id IS NOT NULL
          `
        );
      }

      if (isDeleting) {
        query = (
          `
            SELECT orders.*, customers.qb_id as customer_qb_id FROM orders
            LEFT JOIN customers ON customers.id = orders.customer_id
            WHERE orders.account_id = ?
            AND orders.is_deleted = 1
            AND orders.qb_id IS NOT NULL
          `
        );
      }

      mysql.query(
        query,
        [accountId, qbSyncDate || 0],
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            logError('qb_sync.salesreceipt.select', mysqlError);
          } else {
            callback(null, qbTokens, qbRealmId, mysqlReply);
          }
        },
      );
    },
    // get order items
    (qbTokens, qbRealmId, data, callback) => {
      const processedData = [];

      async.eachSeries(data, (order, eachSeriesCallback) => {
        mysql.query(
          `
            SELECT * FROM order_items
            WHERE order_id = ?
            AND is_deleted = 0
          `,
          [order.id],
          (mysqlError, mysqlReply) => {
            if (mysqlError) {
              logError('qb_sync.salesreceipt.order_items', mysqlError);
            } else {
              processedData.push(
                Object.assign({}, order, { orderItems: mysqlReply }),
              );

              eachSeriesCallback(null);
            }
          },
        );
      }, (eachSeriesError) => {
        if (eachSeriesError) {
          logError('qb_sync.salesreceipt.each_series_order_items', eachSeriesError);
        } else {
          callback(null, qbTokens, qbRealmId, processedData);
        }
      });
    },
    // sync orders
    (qbTokens, qbRealmId, data, callback) => {
      async.eachSeries(data, (order, eachSeriesCallback) => {
        request.post(
          getSalesReceiptObject(apiUri, qbTokens, qbRealmId, order, isUpdating, isDeleting),
          (postError, qbResponse) => {
            if (postError) {
              logError('qb_sync.salesreceipt.post_error', postError);

              eachSeriesCallback(null);
            } else if (qbResponse.statusCode === 401) {
              async.waterfall([
                (refreshTokenCallback) => {
                  getQbConfigs((qbConfigError, configs) => {
                    if (qbConfigError) {
                      logError('qb_sync.salesreceipt.qb_config', qbConfigError);

                      eachSeriesCallback(null);
                    } else {
                      const intuitAuth = new ClientOAuth2(configs);

                      const token = intuitAuth.createToken(
                        qbTokens.accessToken,
                        qbTokens.refreshToken,
                        qbTokens.tokenType,
                        qbTokens.data,
                      );

                      refreshTokenCallback(null, token);
                    }
                  });
                },
                (token, refreshTokenCallback) => {
                  token.refresh().then((newToken) => {
                    const updatedQbTokens = {
                      accessToken: newToken.accessToken,
                      refreshToken: newToken.refreshToken,
                      tokenType: newToken.tokenType,
                      data: newToken.data,
                    };

                    refreshTokenCallback(null, updatedQbTokens);
                  }).catch((refreshTokenError) => {
                    logError('qb_sync.salesreceipt.qb_config', refreshTokenError);

                    eachSeriesCallback(null);
                  });
                },
                (updatedQbTokens, refreshTokenCallback) => {
                  mysql.query(
                    `
                      UPDATE accounts
                      SET ?
                      WHERE id = ?
                    `,
                    [{ qb_token: JSON.stringify(updatedQbTokens) }, accountId],
                    (mysqlError) => {
                      if (mysqlError) {
                        logError('qb_sync.salesreceipt.update_accounts', mysqlError);

                        eachSeriesCallback(null);
                      } else {
                        refreshTokenCallback(null, updatedQbTokens);
                      }
                    },
                  );
                },
                (updatedQbTokens, refreshTokenCallback) => {
                  request.post(
                    getSalesReceiptObject(apiUri, updatedQbTokens, qbRealmId, order, isUpdating, isDeleting),
                    (error, response) => {
                      if (postError) {
                        logError('qb_sync.salesreceipt.post_error_2', postError);

                        eachSeriesCallback(null);
                      } else {
                        const body = response.body;

                        refreshTokenCallback(null, body);
                      }
                    },
                  );
                },
                (body, refreshTokenCallback) => {
                  if (!(body.SalesReceipt && body.SalesReceipt.Id)) {
                    logError('qb_sync.salesreceipt.body', body);

                    eachSeriesCallback(null);

                    return;
                  }

                  mysql.query(
                    `
                      UPDATE orders
                      SET ?
                      WHERE id = ?
                    `,
                    [{
                      qb_id: isDeleting ? null : body.SalesReceipt.Id,
                      qb_sync_token: isDeleting ? null : body.SalesReceipt.SyncToken,
                    }, order.id],
                    (mysqlError) => {
                      if (mysqlError) {
                        logError('qb_sync.salesreceipt.update_orders', mysqlError);

                        eachSeriesCallback(null);

                        return;
                      }

                      refreshTokenCallback(null);
                    },
                  );
                },
              ], (waterfallError) => {
                if (waterfallError) {
                  logError('qb_sync.salesreceipt.401_waterfall', waterfallError);
                }

                eachSeriesCallback(null);
              });
            } else {
              const body = qbResponse.body;

              if (!(body.SalesReceipt && body.SalesReceipt.Id)) {
                logError('qb_sync.salesreceipt.body_2', body);

                eachSeriesCallback(null);

                return;
              }

              mysql.query(
                `
                  UPDATE orders
                  SET ?
                  WHERE id = ?
                `,
                [{
                  qb_id: isDeleting ? null : body.SalesReceipt.Id,
                  qb_sync_token: isDeleting ? null : body.SalesReceipt.SyncToken,
                }, order.id],
                (mysqlError) => {
                  if (mysqlError) {
                    logError('qb_sync.salesreceipt.update_orders', mysqlError);
                  }

                  eachSeriesCallback(null);
                },
              );
            }
          });
      }, (eachSeriesError) => {
        if (eachSeriesError) {
          logError('qb_sync.salesreceipt.each_series', eachSeriesError);
        }

        callback(null);
      });
    },
  ], (waterfallError) => {
    if (waterfallError) {
      logError('qb_sync.salesreceipt.waterfall_2', waterfallError);
    }

    if (typeof callback === 'function') {
      syncSalesReceiptCallback(null);
    }
  });
}

const qbSyncHandler = {
  post(req, res) {
    const accountId = req.user.accountId;

    let apiUri = 'https://sandbox-quickbooks.api.intuit.com/v3/company';

    if (process.env.NODE_ENV === 'production') {
      apiUri = 'https://quickbooks.api.intuit.com/v3/company';
    }

    mysql.query(
      `
        SELECT qb_last_sync FROM accounts
        WHERE id = ?
        AND is_deleted = 0
      `,
      [accountId],
      (mysqlError, mysqlReply) => {
        if (mysqlError) {
          res.status(500).json({ data: { error: 'unable to sync' } });
        } else {
          const qbSyncDate = mysqlReply[0].qb_last_sync;

          mysql.query(
            `
              UPDATE accounts
              SET qb_last_sync = ?
              WHERE id = ?
              AND is_deleted = 0
            `,
            [new Date(), accountId],
          );

          syncCustomers({ apiUri, accountId },
            syncCustomers({ apiUri, accountId, isUpdating: true, qbSyncDate },
              syncCustomers({ apiUri, accountId, isDeleting: true },
                syncSalesReceipt({ apiUri, accountId },
                  syncSalesReceipt({ apiUri, accountId, isUpdating: true, qbSyncDate },
                    syncSalesReceipt({ apiUri, accountId, isDeleting: true }),
                  ),
                ),
              ),
            ),
          );

          res.json({ data: { message: 'syncing' } });
        }
      },
    );
  },
};

export default qbSyncHandler;
