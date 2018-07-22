import React from 'react';
import Textbox from '../form_fields/textbox';
import TextboxAjaxSearch from '../form_fields/textbox_ajax_search';
import {
  ajaxFetchProduct,
  ajaxFetchProducts,
} from '../../actions/product.actions';

class ProductTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAddingNewProduct: true,
      items: props.isEditing ? null : [{ id: Math.random() }],
      productsFormatted: [],
    };

    this.onClickAddProduct = this.onClickAddProduct.bind(this);
  }

  onClickRemove(e, index) {
    e.preventDefault();

    if (this.state.items.length < 2) {
      return;
    }

    this.setState({
      items: this.state.items.slice(0, index).concat(this.state.items.slice(index + 1)),
    });
  }

  onClickAddProduct() {
    if (!this.isValidated()) {
      return;
    }

    this.setState({
      items: [].concat(this.state.items, { id: Math.random() }),
    });
  }

  getValue() {
    if (!this.isValidated()) {
      return null;
    }

    const output = this.state.items.map((item, index) => {
      const productData = this[`product${index}`].getValue();

      return {
        product_id: productData.product_id || null,
        name: productData.name || productData,
        quantity: Number(this[`qty${index}`].getValue()),
        price: this[`price${index}`].getValue() * 100,
      };
    });

    return JSON.stringify(output);
  }

  setValue(products) {
    if (Array.isArray(products)) {
      const items = products.map(item => (
        {
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: (item.price / 100).toFixed(2),
        }
      ));

      this.setState({ items });
    }
  }

  showError() {
    for (let i = 0; i < this.state.items.length; i += 1) {
      const product = this[`product${i}`];
      const qty = this[`qty${i}`];
      const price = this[`price${i}`];

      if (!product.getValue()) {
        product.showError();
      }

      if (!qty.getValue()) {
        qty.showError();
      }

      if (!price.getValue()) {
        price.showError();
      }
    }
  }

  focus() {
    return null;
  }

  hideError() {
    for (let i = 0; i < this.state.items.length; i += 1) {
      const product = this[`product${i}`];
      const qty = this[`qty${i}`];
      const price = this[`price${i}`];

      product.hideError();
      qty.hideError();
      price.hideError();
    }
  }

  isValidated() {
    let hasError = false;

    for (let i = 0; i < this.state.items.length; i += 1) {
      const product = this[`product${i}`];
      const qty = this[`qty${i}`];
      const price = this[`price${i}`];

      if (!product.getValue()) {
        hasError = true;
        product.showError();
      } else {
        product.hideError();
      }

      if (!qty.getValue()) {
        hasError = true;
        qty.showError('');
      } else {
        qty.hideError();
      }

      if (!price.getValue()) {
        hasError = true;
        price.showError('');
      } else {
        price.hideError();
      }
    }

    if (hasError) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div
        ref={(c) => { this.productTable = c; }}
        className="product-table table-widget"
      >
        <table
          className="table table-sm nimbus-tb nimbus-hover"
          style={{ border: '1px solid #eee' }}
        >
          <thead>
            <tr className="card-title" style={{ background: '#f3f5f7' }}>
              <th style={{ width: '10%' }}>#</th>
              <th style={{ width: '50%' }}>Product</th>
              <th style={{ width: '20%' }}>Price ($)</th>
              <th style={{ width: '30%' }}>Qty</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {
              this.state.items && this.state.items.map((item, index) => {
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <TextboxAjaxSearch
                        ref={(c) => { this[`product${index}`] = c; }}
                        placeholder="Search Existing or Custom.."
                        fetch={ajaxFetchProducts}
                        editFetch={ajaxFetchProduct}
                        isCustom={!!item.product_id}
                        dispatch={this.props.dispatch}
                        isStatic={this.props.isStatic}
                        defaultId={item.product_id}
                        defaultCustomStore={item}
                        formatStore={(store) => {
                          if (item.product_id) {
                            return Object.assign({}, store,
                              { product_id: store ? store.id : null },
                            );
                          }

                          return store;
                        }}
                        processStore={data => Object.assign({}, data, { product_id: data.id })}
                        defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                        onButtonClickProcessValue={data => data.name}
                        onSelection={(productItem) => {
                          const price = productItem.price;

                          this[`price${index}`].setValue(`${(price / 100).toFixed(2)}`);
                        }}
                        formatItemDisplay={data => (data ? data.name : '')}
                        isEditing={this.props.isEditing}
                        showBadge
                        hasNameCheck
                      />
                    </td>
                    <td>
                      <Textbox
                        ref={(c) => { this[`price${index}`] = c; }}
                        placeholder="Price $"
                        restrict="floatOnly"
                        defaultValue={item.price}
                        isStatic={this.props.isStatic}
                      />
                    </td>
                    <td>
                      <Textbox
                        ref={(c) => { this[`qty${index}`] = c; }}
                        placeholder="Quantity"
                        restrict="floatOnly"
                        defaultValue={item.quantity || 1}
                        maxLength={6}
                        isStatic={this.props.isStatic}
                      />
                    </td>
                    <td className="text-center">
                      {
                        !this.props.isStatic && this.state.items.length > 1 && (
                          <a
                            href="#"
                            className="nav-link"
                            onClick={e => this.onClickRemove(e, index)}
                          >
                            remove
                          </a>
                        )
                      }
                    </td>
                  </tr>
                )
              }
              )
            }
          </tbody>
        </table>
        {
          !this.props.isStatic && (
            <div>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={this.onClickAddProduct}
              >
                Add Product
              </button>
            </div>
          )
        }
      </div>
    );
  }
}

export default ProductTable;
