import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import TableWidget from '../widgets/table';
import defaultSchema from '../../schemas/tables/products.default';

class ProductView extends React.Component {
  constructor(props) {
    super(props);

    this.tableSchema = defaultSchema.bind(this);
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

ProductView.defaultProps = {
  settings: PropTypes.objectOf(PropTypes.any),
};

export default withRouter(connect(state => state.settings)(ProductView));
