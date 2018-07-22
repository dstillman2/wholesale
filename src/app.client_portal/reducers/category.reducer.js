function categoryReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_CATEGORY_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_CATEGORY_LIST':
      return Object.assign({}, state, { list: action.value.list });

    case 'UPDATE_CATEGORY_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default categoryReducer;
