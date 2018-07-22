import React from 'react';
import moment from 'moment';

import Button from '../../components/widgets/button';

const na = <span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>;

const defaultSchema = function defaultSchema() {
  return {
    editPath: '/account/orders/edit',

    xhr: {
      select: 'fetchOrder',
    },

    heading: [
      'Order #',
      'Customer',
      'Total Amount',
      'CDD',
      'Status',
      'Order Date',
    ],

    new: (
      <div className="text-center">
        <h4
          className="mb-50"
        >
          No orders have been created yet.
        </h4>
        <Button
          name="Create an Order"
          onClick={() => {
            this.props.history.push({ pathname: '/account/orders/create' });
          }}
          isInlineBlock
        />
      </div>
    ),

    body: [
      data => `#${data.orderNumber}`,
      (data) => {
        if (data.firstName) {
          return `${data.firstName[0]}. ${data.lastName}`;
        }

        return data.lastName;
      },
      data => `$${(data.total / 100).toFixed(2)}`,
      data => (data.shipByDate ? moment(data.ship_by_date).format('LL') : na),
      (data) => {
        switch (data.status) {
          case 'new':
            return <span className="badge badge-success text-uppercase no-radius ls-1">New</span>;
          default:
            return na;
        }
      },
      data => moment(data.created_at).format('LL'),
    ],
  };
};

export default defaultSchema;
