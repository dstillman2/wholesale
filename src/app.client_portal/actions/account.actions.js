import sendAjaxRequest from './ajax.actions';

const updateAccountData = value => ({ type: 'UPDATE_ACCOUNT_DATA', value });
const forceUpdateAccountProps = () => ({ type: 'FORCE_UPDATE_ACCOUNT_PROPS' });

const ajaxFetchAccount = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchAccount',
      dispatchOnSuccess: response => updateAccountData({ data: response.data[0] }),
    },
  ))
);

const ajaxCreateAccount = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createAccount',
    },
  ))
);

const ajaxUpdateAccount = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateAccount',
    },
  ))
);

export {
  ajaxFetchAccount,
  ajaxCreateAccount,
  ajaxUpdateAccount,
  updateAccountData,
  forceUpdateAccountProps,
};
