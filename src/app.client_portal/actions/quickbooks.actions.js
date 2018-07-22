import sendAjaxRequest from './ajax.actions';

const ajaxPostSync = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'quickbooksPostSync',
    },
  ))
);

export {
  ajaxPostSync,
};
