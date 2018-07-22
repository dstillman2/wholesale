import async from 'async';
import xl from 'excel4node';
import pool from '../config/mysql.config';

const orderExcelHandler = {
  get(req, res) {
    const accountId = req.user.accountId;

    async.waterfall([
      (callback) => {
        pool.query(
          `
            SELECT orders.*,
              customers.first_name as customer_first_name,
              customers.last_name as customer_last_name,
              customers.company as customer_company
            FROM orders
            LEFT JOIN customers
            ON customers.id = orders.customer_id
            WHERE orders.account_id = ?
            AND orders.is_deleted = 0
          `,
        accountId,
        (mysqlError, mysqlReply) => {
          if (mysqlError) {
            callback({ status: 500, error: mysqlError });
          } else {
            callback(null, mysqlReply);
          }
        });
      },
      (orderDataSet, callback) => {
        async.eachSeries(orderDataSet, (orderItem, eachSeriesCallback) => {
          pool.query(
            `
              SELECT * FROM order_items
              WHERE order_id = ?
              AND is_deleted = 0
            `,
            orderItem.id,
            (mysqlError, mysqlReply) => {
              if (mysqlError) {
                callback({ status: 500, error: mysqlError });
              } else {
                orderItem.items = mysqlReply;

                eachSeriesCallback(null);
              }
            },
          );
        }, (eachSeriesError) => {
          if (eachSeriesError) {
            callback({ status: 500, error: eachSeriesError });
          } else {
            callback(null, orderDataSet);
          }
        });
      },
    ], (waterfallError, orderDataSet) => {
      if (waterfallError) {
        res.status(waterfallError.status).json(waterfallError);
      } else {
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Orders');

        let y = 1;
        ws.cell(1, y++).string('Order ID');
        ws.cell(1, y++).string('Order Status');
        ws.cell(1, y++).string('Order Date');

        ws.cell(1, y++).string('Order Subtotal (cents)');
        ws.cell(1, y++).string('Order Payment Markup (cents)');
        ws.cell(1, y++).string('Order Delivery Fee (cents)');
        ws.cell(1, y++).string('Order Total (cents)');

        ws.cell(1, y++).string('Order Items');

        ws.cell(1, y++).string('Customer First Name');
        ws.cell(1, y++).string('Customer Last Name');
        ws.cell(1, y++).string('Customer Company Name');

        ws.cell(1, y++).string('Shipping First Name');
        ws.cell(1, y++).string('Shipping Last Name');

        ws.cell(1, y++).string('Shipping Address 1');
        ws.cell(1, y++).string('Shipping Address 2');
        ws.cell(1, y++).string('Shipping City');
        ws.cell(1, y++).string('Shipping State');
        ws.cell(1, y++).string('Shipping Zip Code');

        ws.cell(1, y++).string('Email Address');
        ws.cell(1, y++).string('Phone Number');
        ws.cell(1, y++).string('EIN');

        orderDataSet.forEach((order, index) => {
          const x = index + 2;
          let y = 1;

          ws.cell(x, y++).number(order.id);
          ws.cell(x, y++).string(order.order_status);
          ws.cell(x, y++).string(String(order.created_at));

          ws.cell(x, y++).number(order.price_sub_total);
          ws.cell(x, y++).number(order.price_payment_markup);
          ws.cell(x, y++).number(order.price_delivery_fee);
          ws.cell(x, y++).number(order.price_total);

          ws.cell(x, y++).string(JSON.stringify(
            order.items.map(item => (
              {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              }
            )),
          ));

          ws.cell(x, y++).string(order.customer_first_name || '');
          ws.cell(x, y++).string(order.customer_last_name || '');
          ws.cell(x, y++).string(order.customer_company || '');

          ws.cell(x, y++).string(order.first_name || '');
          ws.cell(x, y++).string(order.last_name || '');

          ws.cell(x, y++).string(order.shipping_address_1 || '');
          ws.cell(x, y++).string(order.shipping_address_2 || '');
          ws.cell(x, y++).string(order.shipping_city || '');
          ws.cell(x, y++).string(order.shipping_state || '');
          ws.cell(x, y++).string(order.shipping_zip_code || '');

          ws.cell(x, y++).string(order.email_address || '');
          ws.cell(x, y++).string(order.phone_number || '');
          ws.cell(x, y++).string(order.EIN || '');
        });

        wb.write('orders.xlsx', res);
      }
    });
  },

  post(req, res) {
    res.end();
  },
};

export default orderExcelHandler;
