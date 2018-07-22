import sendAjaxRequest from './ajax.actions';

const updateOrderData = value => ({ type: 'UPDATE_ORDER_DATA', value });
const forceUpdateOrderProps = () => ({ type: 'FORCE_UPDATE_ORDER_PROPS' });

const ajaxFetchExport = () => {
  window.location = '/api/orders/export';

  return {
    type: 'EXPORTED_ORDER_DATA',
  };
};

const ajaxFetchOrder = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchOrder',
      dispatchOnSuccess: response => updateOrderData({ data: response.data[0] }),
    },
  ))
);

const ajaxCreateOrder = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createOrder',
    },
  ))
);

const ajaxUpdateOrder = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateOrder',
    },
  ))
);

const ajaxDeleteOrder = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'deleteOrder',
    },
  ))
);

export {
  updateOrderData,
  ajaxFetchOrder,
  ajaxCreateOrder,
  ajaxUpdateOrder,
  ajaxDeleteOrder,
  forceUpdateOrderProps,
  ajaxFetchExport,
};
