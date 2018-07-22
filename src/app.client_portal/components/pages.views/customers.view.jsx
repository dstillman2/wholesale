import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import TableWidget from '../widgets/table';
import defaultSchema from '../../schemas/tables/customers.default';

class CustomerView extends React.Component {
  constructor(props) {
    super(props);

    switch (true) {
      default:
        this.tableSchema = defaultSchema;
    }

    this.tableSchema = this.tableSchema.bind(this);
  }

  render() {
    return (
      <div className="container">
        <TableWidget
          {...this.props}
          schema={this.tableSchema()}
        />
      </div>
    );
  }
}

CustomerView.defaultProps = {
  settings: PropTypes.objectOf(PropTypes.any),
};

export default withRouter(connect(state => state)(CustomerView));
