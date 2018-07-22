import React from 'react';
import OrderCreate from './orders.create';

class OrderEdit extends React.Component {
  render() {
    return (
      <OrderCreate
        isEditing
      />
    );
  }
}

export default OrderEdit;
