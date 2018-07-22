// @flow

import type { sessionStorage } from '../flow/type';
import renderCartSummaryComponent from '../component/cart_summary';

/**
 * renders cart summary react component
 * @returns {void}
 */
function updateCartSummary() {
  let items: sessionStorage[] = [];

  if (window.sessionStorage.cart) {
    items = JSON.parse(window.sessionStorage.cart);
  }

  renderCartSummaryComponent({ items });
}

export default updateCartSummary;
