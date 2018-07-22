import sendAjaxRequest from './ajax.actions';

const ajaxPostLogin = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'postLogin',
    },
  ))
);

export {
  ajaxPostLogin,
};
