import sendAjaxRequest from './ajax.actions';

const updateUserData = value => ({ type: 'UPDATE_USER_DATA', value });
const forceUpdateUserProps = () => ({ type: 'FORCE_UPDATE_USER_PROPS' });

const ajaxFetchUser = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchUser',
      dispatchOnSuccess: response => updateUserData({ data: response.data[0] }),
    },
  ))
);

const ajaxUpdateUser = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateUser',
    },
  ))
);

const ajaxUpdateUserPassword = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateUserPassword',
    },
  ))
);

export {
  ajaxFetchUser,
  ajaxUpdateUser,
  updateUserData,
  ajaxUpdateUserPassword,
  forceUpdateUserProps,
};
