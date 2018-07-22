import sendAjaxRequest from './ajax.actions';

const updateCategoryData = value => ({ type: 'UPDATE_CATEGORY_DATA', value });
const updateCategoryList = value => ({ type: 'UPDATE_CATEGORY_LIST', value });
const forceUpdateCategoryProps = () => ({ type: 'FORCE_UPDATE_CATEGORY_PROPS' });

const ajaxFetchCategories = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchCategory',
      dispatchOnSuccess: response => updateCategoryList({ list: response.data }),
    },
  ))
);

const ajaxFetchCategory = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'fetchCategory',
      dispatchOnSuccess: response => updateCategoryData({ data: response.data[0] }),
    },
  ))
);

const ajaxCreateCategory = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'createCategory',
    },
  ))
);

const ajaxUpdateCategory = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'updateCategory',
    },
  ))
);


const ajaxDeleteCategory = c => (
  sendAjaxRequest(Object.assign({}, c,
    {
      select: 'deleteCategory',
    },
  ))
);

export {
  updateCategoryData,
  updateCategoryList,
  ajaxFetchCategories,
  ajaxFetchCategory,
  ajaxCreateCategory,
  ajaxUpdateCategory,
  ajaxDeleteCategory,
  forceUpdateCategoryProps,
};
