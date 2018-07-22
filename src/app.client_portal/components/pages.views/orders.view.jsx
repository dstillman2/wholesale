import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import TableWidget from '../widgets/table';
import defaultSchema from '../../schemas/tables/orders.default';

class OrderView extends React.Component {
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

OrderView.defaultProps = {
  settings: PropTypes.objectOf(PropTypes.any),
};

export default withRouter(connect(state => state)(OrderView));
