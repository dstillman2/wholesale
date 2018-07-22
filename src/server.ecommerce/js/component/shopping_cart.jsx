import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import renderCartSummaryComponent from './cart_summary';

function renderShoppingCartComponent(props) {
  const elem = document.getElementById('shopping-cart');
  const elemViewOnly = document.getElementById('shopping-cart-view-only');

  if (elem) {
    ReactDOM.render(
      <ShoppingCart {...props} />,
      document.getElementById('shopping-cart'),
    );
  } else if (elemViewOnly) {
    ReactDOM.render(
      <ShoppingCart viewOnly {...props} />,
      document.getElementById('shopping-cart-view-only'),
    );
  }
}

class ShoppingCartItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      qty: this.props.quantity,
    };
  }

  onDelete(productId) {
    const cart = JSON.parse(window.sessionStorage.cart);
    const newCart = [];

    cart.forEach((item) => {
      if (item.id !== productId) {
        newCart.push(item);
      }
    });

    window.sessionStorage.setItem('cart', JSON.stringify(newCart));

    renderShoppingCartComponent({ items: newCart });
    renderCartSummaryComponent({ items: newCart });
  }

  onBlur() {
    if (this.state.prevQty) {
      this.setState({ qty: this.state.prevQty, prevQty: null });
    }
  }

  onChange(e, productId, optionName) {
    const updateToQty = this.field.value;

    if (updateToQty === '0') {
      return;
    }

    if (updateToQty === '') {
      this.setState({ qty: '', prevQty: this.state.qty });
    }

    if (/^\d+$/.test(updateToQty) && Number(updateToQty) < 100000) {
      this.setState({ qty: Number(updateToQty), prevQty: null });
      this.updateStores(productId, updateToQty, optionName);
    }
  }

  updateStores(productId, updateToQty, optionName) {
    const cart = JSON.parse(window.sessionStorage.cart);

    const newCart = cart.map((item) => {
      if (item.id === productId) {
        return Object.assign({}, item, { quantity: updateToQty });
      }

      return item;
    });

    window.sessionStorage.setItem('cart', JSON.stringify(newCart));

    renderShoppingCartComponent({ items: newCart });
    renderCartSummaryComponent({ items: newCart });
  }

  changeQuantity(e, type, productId, optionName) {
    e.stopPropagation();

    if (type === 'add') {
      this.setState((prevState) => {
        if (Number(prevState.qty) + 1 < 25) {
          this.updateStores(productId, Number(prevState.qty) + 1, optionName);

          return {
            qty: Number(prevState.qty) + 1,
          };
        }

        return {};
      });
    } else if (type === 'subtract') {
      this.setState((prevState) => {
        if (Number(prevState.qty) - 1 > 0) {
          this.updateStores(productId, Number(prevState.qty) - 1, optionName);

          return {
            qty: Number(prevState.qty) - 1,
          };
        }

        return {};
      });
    }
  }

  render() {
    const imageUrl = `/products/images/${this.props.mainProductImage}`;
    const productUrl = `/products/${this.props.id}`;

    return (
      <tr className="checkout-row">
        <td className="product-col">
          <div className="product" style={{ position: 'relative' }}>
            {
              this.props.viewOnly ? (
                <h3 className="product-title">
                  {this.props.name} {this.props.option && `(${this.props.option})`}
                </h3>
              ) : (
                <h3 className="product-title">
                  <a href={productUrl}>
                    {this.props.name} {this.props.option && `(${this.props.option})`}
                  </a>
                </h3>
              )
            }
          </div>
        </td>
        <td className="price-col">${this.props.price}</td>
        {
          this.props.viewOnly ? (
            <td className="quantity-col">
              {this.state.qty}
            </td>
          ) : (
            <td
              className="quantity-col"
              onClick={(e) => { this.onChange(e, this.props.id, this.props.option); }}
            >
              <div style={{ position: 'relative', width: 87, overflow: 'hidden' }}>
                <input
                  ref={(e) => { this.field = e; }}
                  className="form-control"
                  type="text"
                  onChange={(e) => { this.onChange(e, this.props.id, this.props.option); }}
                  onBlur={(e) => { this.onBlur(e); }}
                  value={this.state.qty}
                />
                <div style={{ position: 'absolute', top: 0, right: 0, fontWeight: 'bold', textAlign: 'center' }}>
                  <div className="qty-change" onClick={(e) => this.changeQuantity(e, 'add', this.props.id, this.props.option)}>+</div>
                  <div className="qty-change" onClick={(e) => this.changeQuantity(e, 'subtract', this.props.id, this.props.option)} style={{ borderTop: '0px' }}>-</div>
                </div>
              </div>
              {
                !this.props.viewOnly && (
                  <div style={{ marginTop: 10 }}>
                    <a
                      href="#btnDelete"
                      role="button"
                      onClick={() => this.onDelete(this.props.id, this.props.option)}
                    ><u>Remove</u></a>
                  </div>
                )
              }
            </td>
          )
        }
        <td className="total-col">
          ${Number((this.props.price * this.props.quantity).toFixed(2)).toLocaleString()}
        </td>
      </tr>
    );
  }
}

ShoppingCartItems.defaultProps = {
  viewOnly: false,
  option: '',
};

ShoppingCartItems.propTypes = {
  price: PropTypes.number.isRequired,
  viewOnly: PropTypes.bool,
  option: PropTypes.string,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  mainProductImage: PropTypes.string.isRequired,
};

class ShoppingCart extends React.Component {
  render() {
    let subTotal = 0;
    const deliveryFee = 0;

    this.props.items.forEach((item) => {
      subTotal += (item.price * item.quantity);
    });

    subTotal = Number(subTotal.toFixed(2));

    const total = deliveryFee + subTotal;

    if (total - deliveryFee === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div>Nothing added to your shopping cart.</div>
        </div>
      );
    }

    return (
      <div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                { !this.props.viewOnly && (<th />) }
              </tr>
            </thead>
            <tbody>
              {
                this.props.items.map(
                  item => {
                    return (
                      <ShoppingCartItems
                        viewOnly={this.props.viewOnly}
                        key={String(item.id) + item.option}
                        {...item}
                      />
                  )}
                )
              }
            </tbody>
          </table>
        </div>
        {
          !this.props.viewOnly && (
            <div className="row">
              <div className="col-sm-4 col-sm-offset-8">
                <div className="cart-proceed">
                  {
                    // <p className="cart-subtotal">
                    //   <span>SubTotal :</span> ${subTotal.toFixed(2)}
                    // </p>
                  }
                  {
                    // <p className="cart-subtotal">
                    //   <span>Delivery Fee :</span> TBD
                    // </p>
                  }
                  <p className="cart-total">
                    <span>Total :</span> <span className="text-primary">${Number(total.toFixed(2)).toLocaleString()}</span>
                  </p>
                  <a href="/account/checkout" className="btn btn-primary">Proceed to Checkout</a>
                </div>
              </div>
            </div>
          )
        }
        {
          this.props.viewOnly && (
            <div className="row">
              <div className="col-sm-4 col-sm-offset-8">
                <div className="cart-proceed">
                  {
                    <p className="cart-subtotal">
                      <span>SUB TOTAL :</span> ${subTotal}
                    </p>
                  }
                  {
                    this.props.paymentType !== 'cash' ? (
                      <div>
                        <p className="cart-subtotal">
                          <span>Payment Markup ({window.data.orderMarkup}%):</span> ${Number((total * (window.data.orderMarkup / 100)).toFixed(2))}
                        </p>
                        <p className="cart-total">
                          <span>TOTAL :</span> <span className="text-primary">${(total + Number((total * (window.data.orderMarkup / 100)))).toFixed(2)}</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="cart-total">
                          <span>TOTAL :</span> <span className="text-primary">${total}</span>
                        </p>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

ShoppingCart.defaultProps = {
  items: [],
  minPurchase: 6500,
  deliveryFee: 500,
  viewOnly: false,
};

ShoppingCart.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  minPurchase: PropTypes.number,
  deliveryFee: PropTypes.number,
  viewOnly: PropTypes.bool,
};

export default renderShoppingCartComponent;
