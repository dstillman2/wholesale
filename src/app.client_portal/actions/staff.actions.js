import sendAjaxRequest from './ajax.actions';

const updateStaffData = value => ({ type: 'UPDATE_STAFF_DATA', value });
const forceUpdateStaffProps = () => ({ type: 'FORCE_UPDATE_STAFF_PROPS' });

const ajaxFetchStaff = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchStaff',
      dispatchOnSuccess: response => updateStaffData({ data: response.data[0] }),
    },
  ))
);

const ajaxCreateStaff = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createStaff',
    },
  ))
);

const ajaxUpdateStaff = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateStaff',
    },
  ))
);


const ajaxDeleteStaff = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'deleteStaff',
    },
  ))
);

export {
  updateStaffData,
  ajaxFetchStaff,
  ajaxCreateStaff,
  ajaxUpdateStaff,
  ajaxDeleteStaff,
  forceUpdateStaffProps,
};
