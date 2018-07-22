import React from 'react';
import PropTypes from 'prop-types';
import Textbox from '../form_fields/textbox';
import Loader from '../widgets/loader';
import {
  ajaxFetchProduct,
  ajaxUpdateProductInventory,
} from '../../actions/product.actions';

class InventoryTracking extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onSet = this.onSet.bind(this);
    this.onAdd = this.onAdd.bind(this);
  }

  onSet() {
    this.updateProductInventory({
      type: 'set',
      value: this.field.getValue(),
    });
  }

  onAdd() {
    this.updateProductInventory({
      type: 'add',
      value: this.field.getValue(),
    });
  }

  fetchProduct(pathId) {
    this.props.dispatch(ajaxFetchProduct({
      pathId,
      onComplete: () => {
        this.setState({ isLoading: false });
        this.field.setValue('');
      },
    }));
  }

  updateProductInventory(data) {
    if (!data.value) {
      this.field.showError('Please enter a value.');
      this.field.focus();

      return;
    }

    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxUpdateProductInventory({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchProduct(this.props.match.params.id);
      },
      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-8">
          <Textbox
            ref={(c) => { this.field = c; }}
            placeholder="i.e. 5"
            type="text"
            restrict="intAndNegInt"
          />
        </div>
        <div className="col-xs-4" style={{ marginLeft: 15 }}>
          {
            this.state.isLoading ? (
              <Loader hasNoMargin />
            ) : (
              <div>
                <button
                  type="button"
                  className="btn btn-secondary mr-10"
                  onClick={this.onSet}
                >
                  Set
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mr-10"
                  onClick={this.onAdd}
                >
                  Add
                </button>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

InventoryTracking.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

export default InventoryTracking;
