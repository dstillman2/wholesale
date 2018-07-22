import React from 'react';
import ProductCreate from './products.create';

class ProductEdit extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <ProductCreate
        isEditing
      />
    );
  }
}

export default ProductEdit;
