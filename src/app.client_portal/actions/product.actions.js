import sendAjaxRequest from './ajax.actions';

const updateProductData = value => ({ type: 'UPDATE_PRODUCT_DATA', value });
const updateProductList = value => ({ type: 'UPDATE_PRODUCT_LIST', value });
const forceUpdateProductProps = () => ({ type: 'FORCE_UPDATE_PRODUCT_PROPS' });

const ajaxFetchProducts = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchProduct',
      dispatchOnSuccess: response => updateProductList({ list: response.data }),
    },
  ))
);

const ajaxFetchProduct = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchProduct',
      dispatchOnSuccess: response => updateProductData({ data: response.data[0] }),
    },
  ))
);

const ajaxUploadProductImage = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'uploadProduct',
      isFormData: true,
    },
  ))
);

const ajaxCreateProduct = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createProduct',
    },
  ))
);

const ajaxUpdateProduct = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateProduct',
    },
  ))
);

const ajaxUpdateProductInventory = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateProductInventory',
    },
  ))
);

const ajaxDeleteProduct = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'deleteProduct',
    },
  ))
);

export {
  updateProductData,
  ajaxUpdateProductInventory,
  updateProductList,
  ajaxFetchProducts,
  ajaxFetchProduct,
  ajaxCreateProduct,
  ajaxUpdateProduct,
  ajaxDeleteProduct,
  ajaxUploadProductImage,
  forceUpdateProductProps,
};
