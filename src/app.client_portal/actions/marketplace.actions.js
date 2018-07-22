import sendAjaxRequest from './ajax.actions';

const updateMarketplaceData = value => ({ type: 'UPDATE_MARKETPLACE_DATA', value });
const forceUpdateMarketplaceProps = () => ({ type: 'FORCE_UPDATE_MARKETPLACE_PROPS' });

const ajaxFetchMarketplace = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchMarketplace',
      dispatchOnSuccess: response => updateMarketplaceData({ data: response.data }),
    },
  ))
);

const ajaxCreateMarketplace = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createMarketplace',
    },
  ))
);

const ajaxUpdateMarketplace = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateMarketplace',
    },
  ))
);


const ajaxDeleteMarketplace = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'deleteMarketplace',
    },
  ))
);

export {
  updateMarketplaceData,
  ajaxFetchMarketplace,
  ajaxCreateMarketplace,
  ajaxUpdateMarketplace,
  ajaxDeleteMarketplace,
  forceUpdateMarketplaceProps,
};
