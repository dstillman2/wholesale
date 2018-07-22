import sendAjaxRequest from './ajax.actions';

const updateStatisticData = value => ({ type: 'UPDATE_STATISTIC_DATA', value });

const ajaxFetchStatistics = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchStatistics',
      dispatchOnSuccess: response => updateStatisticData({ data: response }),
    },
  ))
);

export {
  ajaxFetchStatistics,
  updateStatisticData,
};
