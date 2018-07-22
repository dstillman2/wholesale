import sendAjaxRequest from '../func/xml_http_request';

import renderCartSummaryComponent from '../component/cart_summary';
import renderShoppingCartComponent from '../component/shopping_cart';

function showErrorMessage(message) {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = message;

  window.scrollTo(0, 0);
}

function removeErrorMessage() {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = '';
}

class Checkout {
  constructor() {
    this.output = {};
    this.total = null;

    this.requiredFields = {
      company: { validation: val => typeof val === 'string' && val.length > 0 },

      first_name: { validation: val => typeof val === 'string' && val.length > 0 },
      last_name: { validation: val => typeof val === 'string' && val.length > 0 },

      shipping_address_1: { validation: val => typeof val === 'string' && val.length > 0 },
      shipping_address_2: { validation: () => true },
      shipping_city: { validation: val => typeof val === 'string' && val.length > 0 },
      shipping_state: { validation: val => typeof val === 'string' && val.length > 0 },
      shipping_zip_code: { validation: val => typeof val === 'string' && val.length > 0 },
      email_address: { validation: val => typeof val === 'string' && val.length > 0 },
      phone_number: { validation: val => typeof val === 'string' && val.length > 0 },
    };
  }

  back() {
    removeErrorMessage();

    document.getElementById('back-btn').style.display = 'none';

    document.getElementById('checkout-address-input').style.display = 'block';
    document.getElementById('checkout-payment').style.display = 'none';

    document.getElementById('checkout-btn').value = 'Next Step';
    document.getElementById('checkout-btn').setAttribute('onclick', 'ecom.checkout.onValidateAddressFields(event)');
    document.getElementById('form-submit').setAttribute('onsubmit', 'ecom.checkout.onValidateAddressFields(event)');
  }

  onValidateAddressFields() {
    if (!window.sessionStorage.cart || JSON.parse(window.sessionStorage.cart).length === 0) {
      showErrorMessage('Please add an item to your cart prior to checking out.');

      return;
    }

    const validationFailureList = [];
    this.output = {};

    Object.keys(this.requiredFields).forEach((key) => {
      const elem = document.querySelector(`input[name="${key}"]`);
      elem.className = 'form-control';

      if (!this.requiredFields[key].validation(elem.value)) {
        validationFailureList.push(key);
      } else {
        this.output[key] = document.querySelector(`input[name="${key}"]`).value;
      }
    });

    if (validationFailureList.length !== 0) {
      document.getElementById('error-message').innerHTML = (
        'Please fill out all required fields.'
      );

      validationFailureList.reverse().forEach((field) => {
        const elem = document.querySelector(`input[name="${field}"]`);
        elem.className = 'form-control error';
        elem.focus();
      });

      return;
    }

    const elems = document.querySelectorAll('input[name="payment_type"]');

    elems.forEach((elem) => {
      if (elem.checked === true) {
        this.output.payment_type = elem.value;
      }
    });

    removeErrorMessage();

    document.getElementById('checkout-payment').style.display = 'block';
    document.getElementById('checkout-address-input').style.display = 'none';
    document.getElementById('back-btn').style.display = 'block';
    document.getElementById('checkout-btn').setAttribute('onclick', 'ecom.checkout.onCreateOrder(event)');
    document.getElementById('form-submit').setAttribute('onsubmit', 'ecom.checkout.onCreateOrder(event)');

    window.scrollTo(0, 0);

    const a = this.output;

    document.getElementById('address-1').innerHTML = (
      `
        <div class="row">
          <div class="col-sm-6">
            <p>
              ${a.company}<br/>
              ${a.first_name} ${a.last_name}<br/>
              ${a.shipping_address_1} ${a.shipping_address_2}<br/>
              ${a.shipping_city}, ${a.shipping_state} ${a.shipping_zip_code}
            </p>
          </div>
        </div>
      `
    );

    const paymentType = this.output.payment_type;

    document.getElementById('pp').innerHTML = (
      `
        <div class="row">
          <div class="col-sm-6">
            ${paymentType[0].toUpperCase()}${paymentType.slice(1).replace('_', ' ')}
          </div>
        </div>
      `
    );

    if (paymentType === 'cash') {
      document.getElementById('checkout-btn').value = 'Complete Order';
      document.getElementById('checkout-btn').setAttribute('onclick', 'ecom.checkout.onCashClick(event)');
    } else {
      this.handler = window.StripeCheckout.configure({
        key: window.data.stripePublishableKey,
        locale: 'auto',
        bitcoin: !!window.data.hasBitcoin,
        token: (token) => {
          if (token.card) {
            this.output.stripe_token_object = JSON.stringify(token);

            this.createOrder('credit_card');
          } else if (token.bitcoin) {
            this.output.stripe_token_object = JSON.stringify(token);

            this.createOrder('bitcoin');
          } else {
            showErrorMessage('There was an error submitting the order. Please try again or contact support.');
          }
        },
      });

      window.addEventListener('popstate', () => {
        this.handler.close();
      });

      document.getElementById('checkout-btn').value = 'Make Payment';
      document.getElementById('checkout-btn').setAttribute('onclick', 'ecom.checkout.onStripeClick(event)');
    }

    renderShoppingCartComponent({
      items: JSON.parse(window.sessionStorage.cart),
      paymentType,
    });
  }

  onCashClick(e) {
    e.preventDefault();

    const total = JSON.parse(window.sessionStorage.cart)
      .reduce((sum, item) => sum + (item.price * 100 * item.quantity), 0);

    this.output.displayed_total = total;

    this.createOrder('cash');
  }

  onStripeClick(e) {
    e.preventDefault();

    let markup = 0;

    const total = JSON.parse(window.sessionStorage.cart)
      .reduce((sum, item) => sum + (item.price * 100 * item.quantity), 0);

    if (this.output.payment_type === 'credit_card') {
      markup = Number((total * (window.data.orderMarkup / 100)).toFixed(0));
    }

    this.output.displayed_total = total + markup;

    this.handler.open({
      zipCode: true,
      amount: total + markup,
    });
  }

  createOrder(paymentType) {
    const btn = document.querySelector('#checkout-btn');

    btn.value = 'Processing..';
    btn.setAttribute('disabled', true);
    btn.onclick = 'return false;';

    sendAjaxRequest({
      path: '/account/orders',

      method: 'POST',

      data: Object.assign({}, this.output, {
        items: window.sessionStorage.cart,
        payment_type: paymentType,
      }),

      onSuccess: () => {
        const thankYouBlock = document.getElementById('thank-you');
        const checkoutForm = document.getElementById('checkout-form');

        thankYouBlock.style.display = 'block';
        checkoutForm.style.display = 'none';

        window.sessionStorage.clear();

        renderCartSummaryComponent({ items: [] });
        renderShoppingCartComponent({ items: [] });
      },

      onFailure: (response) => {
        if (paymentType === 'cash') {
          document.getElementById('checkout-btn').value = 'Make Payment';
          document.getElementById('checkout-btn').setAttribute('onclick', 'ecom.checkout.onCashClick(event)');
        } else {
          document.getElementById('checkout-btn').value = 'Make Payment';
          document.getElementById('checkout-btn').setAttribute('onclick', 'ecom.checkout.onStripeClick(event)');
        }

        if (response.data && response.data.code === 509) {
          showErrorMessage(response.data.error);
        } else {
          showErrorMessage('There was an error submitting the order. Please try again.');
        }
      },

      onComplete: () => {
        btn.value = 'Complete Order';
        btn.removeAttribute('disabled');
      },
    });
  }
}

const checkout = new Checkout();

export {
  checkout,
};
