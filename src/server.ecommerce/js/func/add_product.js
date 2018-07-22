// @flow

import type { sessionStorage, ProductSpec } from '../flow/type';

/**
 * Adds items to sessionStorage
 * @param {Object} productSpec properties describing the product
 * @param {number} productSpec.id product id
 * @param {string} productSpec.name product name
 * @param {number} qty quantity of the item being added to cart
 * @returns {void}
 */
function addItemsTosessionStorage(productSpec: ProductSpec, qty: number): void {
  const productId: number = productSpec.id;
  const optionName: string = productSpec.option;
  const products: string = window.sessionStorage.getItem('cart');

  let items: sessionStorage[] = [];

  if (products) {
    items = JSON.parse(products);

    let isDuplicate = false;

    // if the item is a duplicate, increase the quantity of the product in cart
    items = items.map((product) => {
      if (product.id === productId && product.option === optionName) {
        isDuplicate = true;

        return Object.assign({}, product, { quantity: Number(product.quantity) + Number(qty) });
      }

      return product;
    });

    // if the item isn't a duplicate, append to array
    if (!isDuplicate) {
      items = [].concat(items, Object.assign({}, productSpec, { quantity: qty }));
    }
  } else {
    // no items have yet been added to the cart
    items = [Object.assign({}, productSpec, { quantity: qty })];
  }

  window.sessionStorage.setItem('cart', JSON.stringify(items));
}

export default addItemsTosessionStorage;
