import React from 'react';
import Button from '../../components/widgets/button';

const badge = text => <span className="badge badge-secondary text-uppercase no-radius ls-1">{text}</span>;

const defaultSchema = function defaultSchema() {
  return {
    hasSearchBar: true,

    editPath: '/account/products/edit',

    xhr: {
      select: 'fetchProduct',
    },

    heading: [
      {
        name: 'Product',
        column: 'name',
      },
      {
        name: 'Inventory',
        column: 'inventory',
      },
      {
        name: 'Qty Sold',
        column: 'qty_sold',
      },
      {
        name: 'Marketplace',
      },
    ],

    new: (
      <div className="text-center">
        <h4
          className="mb-50"
        >
          No products have been created yet.
        </h4>
        {
          window.orderNimbusSettings.permissions.write.products && (
            <Button
              name="Create a Product"
              onClick={() => {
                this.props.history.push({ pathname: '/account/products/create' });
              }}
              isInlineBlock
            />
          )
        }
      </div>
    ),

    body: [
      data => (
        <div style={{ fontSize: '1.1em' }}>{data.name}</div>
      ),
      (data) => {
        if (data.hasInventoryTracking && typeof data.inventory === 'number') {
          return data.inventory;
        }

        return badge('Not Tracked');
      },
      data => (typeof data.qtySold === 'number' ? data.qtySold : badge('None')),
      data => (data.isActiveMarketplace ? badge('Live') : badge('Hidden')),
    ],
  };
};

export default defaultSchema;
