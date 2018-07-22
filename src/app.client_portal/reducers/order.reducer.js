function productReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_ORDER_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_ORDER_LIST':
      return Object.assign({}, state, { list: action.value.list });

    case 'UPDATE_ORDER_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default productReducer;
