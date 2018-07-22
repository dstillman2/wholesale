import sendAjaxRequest from '../func/xml_http_request';

function addErrorMessage(message) {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = message;

  const successMsg = document.getElementById('success-message');

  successMsg.innerHTML = '';
}

function addSuccessMessage(message) {
  const successMsg = document.getElementById('success-message');

  successMsg.innerHTML = message;

  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = '';
}

function enableButton(btn) {
  btn.value = 'Reset Password';
  btn.removeAttribute('disabled');
}

function onResetPassword(e) {
  e.preventDefault();
  e.stopPropagation();

  // set btn to Loading
  const btn = document.querySelector('#btn-submit');

  btn.value = 'Loading';
  btn.setAttribute('disabled', true);

  const data = {
    password: document.querySelector('input[name="password"]').value,
    token: window.location.href.split('?')[1].split('=')[1],
  };

  Object.keys(data).reverse().forEach((key) => {
    if (!data[key]) {
      document.querySelector(`input[name=${key}]`).focus();
    }
  });

  sendAjaxRequest({
    path: '/reset-password',

    method: 'POST',

    data,

    onSuccess: () => {
      addSuccessMessage('Your password has been successfully updated.');

      document.querySelector('input[name="password"]').value = '';
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
  onResetPassword,
};
