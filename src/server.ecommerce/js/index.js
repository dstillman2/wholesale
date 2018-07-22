import 'es7-object-polyfill';
import '../lib/object.polyfill';

import { onSignUp } from './pages/sign_up';
import { onSignIn } from './pages/sign_in';
import { onAddToCart, onQtyChange, onOptionsClick } from './pages/products';
import { fetchOrders } from './pages/account';
import { onSendMessage } from './pages/contact';
import { onForgotPassword } from './pages/forgot_password';
import { onResetPassword } from './pages/reset_password';
import { onCreateOrder, onCalculateDeliveryFee, checkout } from './pages/checkout';
import renderCartSummaryComponent from './component/cart_summary';
import renderShoppingCartComponent from './component/shopping_cart';

window.ecom = {
  onSignUp,
  onSignIn,
  onAddToCart,
  fetchOrders,
  onSendMessage,
  onCreateOrder,
  onQtyChange,
  onOptionsClick,
  onCalculateDeliveryFee,
  onForgotPassword,
  onResetPassword,
  checkout,
};

let items = [];

if (window.sessionStorage.cart) {
  items = JSON.parse(window.sessionStorage.cart);
}

renderCartSummaryComponent({ items });
renderShoppingCartComponent({ items });
