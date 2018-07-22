import React from 'react';
import moment from 'moment';
import Button from '../../components/widgets/button';

const defaultSchema = function defaultSchema() {
  return {
    hasSearchBar: true,

    editPath: '/account/customers/edit',

    xhr: {
      select: 'fetchCustomer',
    },

    heading: [
      {
        name: 'Company',
        column: 'company',
      },
      {
        name: 'Name',
        column: 'last_name',
      },
      {
        name: 'Location',
      },
      // {
      //   name: 'Total Orders',
      // },
      // {
      //   name: 'Total Revenue',
      // },
      {
        name: 'Status',
      },
      {
        name: 'Join Date',
        column: 'created_at',
      },
    ],

    new: (
      <div className="text-center">
        <h4
          className="mb-50"
        >
          No customer accounts have been created yet.
        </h4>
        {
          window.orderNimbusSettings.permissions.write.customers && (
            <Button
              name="Add a Customer"
              onClick={() => {
                this.props.history.push({ pathname: '/account/customers/create' });
              }}
              isInlineBlock
            />
          )
        }
      </div>
    ),

    body: [
      data => data.company,
      (data) => {
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';

        if (firstName) {
          return `${firstName} ${lastName}`;
        }

        return `${lastName}`;
      },
      data => `${data.city || ''}${data.city ? ',' : ''} ${data.state || ''}`,
      // data => data.total_orders || <span className="badge badge-secondary text-uppercase no-radius ls-1">None</span>,
      // data => `$${Number((data.total_revenue / 100).toFixed(2)).toLocaleString()}`,
      data => (data.is_active ? (
        <span className="badge badge-secondary text-uppercase no-radius ls-1">Active</span>
      ) : (
        <span className="badge badge-secondary text-uppercase no-radius ls-1">Inactive</span>
      )),
      data => moment(data.created_at).format('LL'),
    ],
  };
};

export default defaultSchema;
