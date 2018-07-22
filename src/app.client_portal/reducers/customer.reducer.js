function customerReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_CUSTOMER_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_CUSTOMER_LIST':
      return Object.assign({}, state, { list: action.value.data });

    case 'UPDATE_CUSTOMER_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default customerReducer;
