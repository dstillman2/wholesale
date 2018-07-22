import addItemsToSessionStorage from '../func/add_product';
import updateCartSummary from '../func/cart_summary';

function onAddToCart(e) {
  e.preventDefault();

  const productSpec = window.productSpec;
  const qty = document.getElementById('qty').value;

  if (qty === '' || Number(qty) === 0) {
    document.getElementById('qty').value = 1;

    return;
  }

  const addToCartBtn = document.getElementById('addtocart');

  // flash button & trigger modal
  addToCartBtn.innerHTML = 'Added to Cart!';
  addToCartBtn.style.color = '#FFF';
  addToCartBtn.style.backgroundColor = '#000';
  addToCartBtn.style.cursor = 'default';
  addToCartBtn.onclick = '';

  const toggleDiv = document.querySelector('#cart-summary .dropdown-toggle');

  window.setTimeout(() => toggleDiv.click());
  window.setTimeout(() => {
    addToCartBtn.innerHTML = 'Add to Cart';
    addToCartBtn.style = {};
    addToCartBtn.setAttribute('onclick', 'ecom.onAddToCart(event);return false;');
  }, 1500);

  // set items into sessionStorage
  addItemsToSessionStorage(productSpec, Number(qty));

  // notify cart summary of update
  updateCartSummary();
}

function onQtyChange() {
  const qty = document.getElementById('qty');

  if (qty.value === '0') {
    qty.value = 1;
  }
}

function onOptionsClick(e) {
  e.preventDefault();

  if (e.target.tagName === 'SPAN') {
    const optionElem = document.getElementById('options');

    Array.prototype.slice.call(optionElem.children).forEach((elem) => {
      elem.className = '';
    });

    e.target.parentElement.className = 'active';

    window.productSpec = (
      Object.assign({}, window.productSpec, { option: window.$(e.target).data().type })
    );
  }
}

export {
  onAddToCart,
  onQtyChange,
  onOptionsClick,
};
