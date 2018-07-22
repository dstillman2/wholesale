import 'formdata-polyfill';
import sendAjaxRequest from '../func/xml_http_request';

const requiredFields = {
  company: { validation: val => typeof val === 'string' && val.length > 0 },
  first_name: { validation: val => typeof val === 'string' && val.length > 0 },
  last_name: { validation: val => typeof val === 'string' && val.length > 0 },
  email_address: { validation: val => typeof val === 'string' && val.length > 0 },
  phone_number: { validation: val => typeof val === 'string' && val.length > 0 },

  address_1: { validation: val => typeof val === 'string' && val.length > 0 },
  address_2: { validation: () => true },
  city: { validation: val => typeof val === 'string' && val.length > 0 },
  state: { validation: val => typeof val === 'string' && val.length > 0 },
  zip_code: { validation: val => typeof val === 'string' && val.length > 0 },

  ein: { validation: () => true },

  password: { validation: val => typeof val === 'string' && val.length > 0 },
  confirm_password: { validation: val => typeof val === 'string' && val.length > 0 },
};

function addErrorMessage(message) {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = message;
}

function addPasswordErrorMessage(message) {
  const errorMsg = document.getElementById('password-error-message');

  errorMsg.innerHTML = message;
}

function routeToSuccessMessage() {
  const successPanel = document.getElementById('confirmation');

  successPanel.style.display = 'block';

  const signupPanel = document.getElementById('account');

  signupPanel.style.display = 'none';
}

function enableButton(btn) {
  btn.value = 'Sign Up';
  btn.removeAttribute('disabled');
}

function onSignUp(e) {
  e.preventDefault();

  addPasswordErrorMessage('');
  addErrorMessage('');

  const form = document.querySelector('form.signup-form');
  const formData = new FormData(form);

  // validate fields
  const validationFailureList = [];

  Object.keys(requiredFields).reverse().forEach((key) => {
    document.querySelector(`input[name="${key}"]`).className = 'form-control';

    if (!requiredFields[key].validation(formData.get(key))) {
      validationFailureList.push(key);
      document.querySelector(`input[name=${key}]`).focus();
    }
  });

  if (validationFailureList.length !== 0) {
    document.getElementById('error-message').innerHTML = 'Please fill out all required fields.';

    validationFailureList.forEach((field) => {
      document.querySelector(`input[name="${field}"]`).className = 'form-control error';
    });

    return;
  }

  // validate password
  if (formData.get('password') !== formData.get('confirm_password')) {
    addPasswordErrorMessage('The password field and confirm password field does not match.');

    return;
  } else if (formData.get('password').length < 6) {
    addPasswordErrorMessage('Password must be at least 6 characters.');

    return;
  }

  const btn = document.querySelector('#btn-signup');

  btn.value = 'Loading';
  btn.setAttribute('disabled', true);

  formData.delete('confirm_password');

  sendAjaxRequest({
    path: '/sign-up',

    method: 'POST',

    data: formData,

    onSuccess: () => {
      routeToSuccessMessage();
    },

    onFailure: (response) => {
      if (response.error && response.error.data && response.error.data.code === 100596) {
        addErrorMessage('This email address already exists. Please contact support or sign in.');
      } else {
        addErrorMessage('Your account cannot be created. Please try again.');
      }
    },

    onComplete: () => {
      window.scrollTo(0, 0);

      enableButton(btn);
    },

    isFormData: true,
  });
}

export {
  onSignUp,
};
