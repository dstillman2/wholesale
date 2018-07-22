import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import renderShoppingCartComponent from './shopping_cart';

class CartSummaryItems extends React.Component {
  onDelete(productId, optionName) {
    const cart = JSON.parse(window.sessionStorage.cart);
    const newCart = [];
    cart.forEach((item) => {
      if (!(item.id === productId && item.option === optionName)) {
        newCart.push(item);
      }
    });

    window.sessionStorage.setItem('cart', JSON.stringify(newCart));

    renderCartSummaryComponent({ items: newCart });
    renderShoppingCartComponent({ items: newCart });
  }

  render() {
    let imageUrl;

    if (this.props.mainProductImage) {
      imageUrl = this.props.mainProductImage;
    }

    const productUrl = `/products/${this.props.id}`;

    return (
      <div className="product">
        <figure className="product-image-container">
          {
            imageUrl ? (
              <img src={imageUrl} style={{ maxHeight: '100px' }} alt="" />
            ) : (
              <div className="no-image-sm">No Image</div>
            )
          }
        </figure>

        <div>
          <h4 className="product-title"><a href={productUrl}>
            {this.props.name} {this.props.option && `(${this.props.option})`}
          </a></h4>
          <div className="product-price-container">
            <span className="product-price">$ {this.props.price}</span>
          </div>
          <div className="product-qty">Qty {this.props.quantity}</div>
        </div>
      </div>
    );
  }
}

class CartSummary extends React.Component {
  render() {
    let total = 0;
    this.props.items.forEach((item) => {
      total += (item.price * item.quantity);
    });

    total = total.toFixed(2);

    return (
      <div className="dropdown cart-dropdown">
        <a className="dropdown-toggle" href="#nothing" data-toggle="dropdown" role="button" aria-expanded="false">
          <span className="cart-icon">
            <img src="/vendor/assets/images/bag.png" alt="Cart" />
            <span className="cart-count">{this.props.items.length}</span>
          </span>
          <i className="fa fa-caret-down" />
        </a>
        <div className="dropdown-menu dropdown-menu-right">
          <p className="dropdown-cart-info">You have {this.props.items.length} products in your cart.</p>
          {
            Math.round(total) !== 0 && (
              <div className="dropdown-menu-wrapper" style={{ maxHeight: '350px', overflow: 'auto' }}>
                {
                  this.props.items.map(item => <CartSummaryItems key={String(item.id) + item.option} {...item} />)
                }
              </div>
            )
          }
          {
            Math.round(total) !== 0 && (
              <div className="cart-dropdowm-action">
                <div className="dropdowm-cart-total"><span>TOTAL:</span> ${total}</div>
                <a href="/account/cart" className="btn btn-primary">View Cart</a>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

CartSummary.defaultProps = {
  items: [],
};

CartSummary.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
};

function renderCartSummaryComponent(props) {
  const elem = document.getElementById('cart-summary');

  if (elem) {
    ReactDOM.render(<CartSummary {...props} />, document.getElementById('cart-summary'));
  }
}

export default renderCartSummaryComponent;
