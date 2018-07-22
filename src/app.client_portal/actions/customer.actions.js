import sendAjaxRequest from './ajax.actions';

const updateCustomerList = value => ({ type: 'UPDATE_CUSTOMER_LIST', value });
const updateCustomerData = value => ({ type: 'UPDATE_CUSTOMER_DATA', value });
const forceUpdateCustomerProps = () => ({ type: 'FORCE_UPDATE_CUSTOMER_PROPS' });

const ajaxFetchCustomers = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchCustomer',
      dispatchOnSuccess: response => updateCustomerList({ data: response.data }),
    },
  ))
);

const ajaxFetchCustomer = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchCustomer',
      dispatchOnSuccess: response => updateCustomerData({ data: response.data[0] }),
    },
  ))
);

const ajaxCreateCustomer = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createCustomer',
    },
  ))
);

const ajaxUpdateCustomer = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateCustomer',
    },
  ))
);


const ajaxDeleteCustomer = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'deleteCustomer',
    },
  ))
);

export {
  updateCustomerData,
  ajaxFetchCustomers,
  ajaxFetchCustomer,
  ajaxCreateCustomer,
  ajaxUpdateCustomer,
  ajaxDeleteCustomer,
  forceUpdateCustomerProps,
};
