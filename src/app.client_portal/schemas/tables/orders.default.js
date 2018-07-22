import React from 'react';
import moment from 'moment';

import Button from '../../components/widgets/button';
import { ajaxFetchExport } from '../../actions/order.actions';

const na = <span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>;

const defaultSchema = function defaultSchema() {
  return {
    hasSearchBar: true,

    hasExport: true,

    onExport: () => {
      this.props.dispatch(ajaxFetchExport());
    },

    editPath: '/account/orders/edit',

    xhr: {
      select: 'fetchOrder',
    },

    heading: [
      {
        name: 'Order #',
      },
      {
        name: 'Customer',
      },
      {
        name: 'Total Price',
      },
      {
        name: 'Status',
      },
      {
        name: 'Order Date',
      },
    ],

    new: (
      <div className="text-center">
        <h4
          className="mb-50"
        >
          No orders have been created yet.
        </h4>
        {
          window.orderNimbusSettings.permissions.write.orders && (
            <Button
              name="Create an Order"
              onClick={() => {
                this.props.history.push({ pathname: '/account/orders/create' });
              }}
              isInlineBlock
            />
          )
        }
      </div>
    ),

    body: [
      data => `#${data.id}`,
      (data) => {
        if (data.firstName) {
          return `${data.company || ''} (${data.firstName[0]}. ${data.lastName})`;
        }

        return data.lastName;
      },
      data => (data.price_total ? `$${(data.price_total / 100).toFixed(2)}` : na),
      (data) => {
        switch (data.orderStatus) {
          case 'unpaid':
            return <span className="badge badge-secondary text-uppercase no-radius ls-1" style={{ margin: 0 }}>Unpaid</span>;
          case 'paid':
            return <span className="badge badge-secondary text-uppercase no-radius ls-1" style={{ margin: 0 }}>Paid</span>;
          case 'shipped':
            return <span className="badge badge-secondary text-uppercase no-radius ls-1">Shipped</span>;
          case 'approved':
            return <span className="badge badge-secondary text-uppercase no-radius ls-1">Approved</span>;
          case 'fulfilled':
            return <span className="badge badge-secondary text-uppercase no-radius ls-1">Fulfilled</span>;
          default:
            return na;
        }
      },
      data => moment(data.created_at).format('LL'),
    ],
  };
};

export default defaultSchema;
