import React from 'react';
import CustomerCreate from './customers.create';

class CustomerEdit extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <CustomerCreate
        isEditing
      />
    );
  }
}

export default CustomerEdit;
