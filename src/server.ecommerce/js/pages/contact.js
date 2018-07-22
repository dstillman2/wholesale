import 'formdata-polyfill';
import sendAjaxRequest from '../func/xml_http_request';

function addMessage(message) {
  const msg = document.getElementById('success-message');

  msg.innerHTML = message;
}

function addErrorMessage(message) {
  const errorMsg = document.getElementById('error-message');

  errorMsg.innerHTML = message;
}

function removeMessage() {
  const errorMsg = document.getElementById('error-message');
  const msg = document.getElementById('success-message');

  errorMsg.innerHTML = '';
  msg.innerHTML = '';
}

function onSendMessage(e) {
  e.preventDefault();

  const form = document.querySelector('form.contact-form');
  const formData = new FormData(form);

  formData.append('client_id', window.clientId);

  // set btn to Loading
  const btn = document.querySelector('#btn-contact');

  btn.value = 'Loading';
  btn.setAttribute('disabled', true);

  const data = {};


  for (let value of formData.entries()) {
    data[value[0]] = value[1];
  }

  sendAjaxRequest({
    path: '/contact',

    method: 'POST',

    data,

    onSuccess: () => {
      removeMessage();
      addMessage('We\'ve received your email and will reply ASAP.');

      Object.keys(data).forEach((item) => {
        const elem = document.querySelector(`[name="${item}"]`);

        if (elem) { elem.value = ''; }
      });
    },

    onFailure: () => {
      removeMessage();
      addErrorMessage('There was an error with this request. Please try again');
    },

    onComplete: () => {
      btn.value = 'Send Message';
      btn.removeAttribute('disabled');
    },
  });
}

export {
  onSendMessage,
};
