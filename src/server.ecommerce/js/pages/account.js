import sendAjaxRequest from '../func/xml_http_request';

function fetchOrders() {
  // sendAjaxRequest({
  //   path: '/account/orders',
  //
  //   method: 'GET',
  //
  //   data: {
  //     clientId: window.clientId,
  //   },
  //
  //   onSuccess: (response) => {
  //     console.log('on success', response);
  //   },
  //
  //   onFailure: () => {
  //     console.log('on failure');
  //   },
  //
  //   onComplete: () => {
  //     console.log('on complete');
  //   },
  // });
}

export {
  fetchOrders,
};
