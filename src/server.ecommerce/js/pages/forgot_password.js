import sendAjaxRequest from '../func/xml_http_request';

function addErrorMessage(message) {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = message;

  const successMsg = document.getElementById('success-message');

  successMsg.innerHTML = '';
}

function routeToSuccessMessage(message) {
  const successMsg = document.getElementById('success-message');

  successMsg.innerHTML = message;

  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = '';
}

function enableButton(btn) {
  btn.value = 'Reset Password';
  btn.removeAttribute('disabled');
}

function onForgotPassword(e) {
  e.preventDefault();
  e.stopPropagation();

  // set btn to Loading
  const btn = document.querySelector('#btn-submit');

  btn.value = 'Loading';
  btn.setAttribute('disabled', true);

  const data = {
    email_address: document.querySelector('input[name="email_address"]').value,
  };

  Object.keys(data).reverse().forEach((key) => {
    if (!data[key]) {
      document.querySelector(`input[name=${key}]`).focus();
    }
  });

  sendAjaxRequest({
    path: '/forgot-password',

    method: 'POST',

    data,

    onSuccess: () => {
      routeToSuccessMessage('Please check your email for the next steps.');

      document.querySelector('input[name="email_address"]').value = '';
    },

    onFailure: () => {
      addErrorMessage('There was an error with this request. Please try again.');
    },

    onComplete: () => {
      enableButton(btn);
    },
  });
}

export {
  onForgotPassword,
};
