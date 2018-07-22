import sendAjaxRequest from '../func/xml_http_request';

function addErrorMessage(message) {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = message;
}

function routeToSuccessMessage() {
  window.location.href = '/account';
}

function enableButton(btn) {
  btn.value = 'Sign In';
  btn.removeAttribute('disabled');
}

function onSignIn(e) {
  e.preventDefault();
  e.stopPropagation();

  // set btn to Loading
  const btn = document.querySelector('#btn-signin');

  btn.value = 'Loading';
  btn.setAttribute('disabled', true);

  const data = {
    email_address: document.querySelector('input[name="email_address"]').value,
    password: document.querySelector('input[name="password"]').value,
  };

  Object.keys(data).reverse().forEach((key) => {
    if (!data[key]) {
      document.querySelector(`input[name=${key}]`).focus();
    }
  });

  sendAjaxRequest({
    path: '/sign-in',

    method: 'POST',

    data,

    onSuccess: () => {
      routeToSuccessMessage();
    },

    onFailure: () => {
      addErrorMessage('The credentials you entered are invalid. Please try again.');
      document.querySelector('input[name="password"]').value = '';
    },

    onComplete: () => {
      enableButton(btn);
    },
  });
}

export {
  onSignIn,
};
