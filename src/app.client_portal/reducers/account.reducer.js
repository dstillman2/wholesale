function accountReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_ACCOUNT_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_ACCOUNT_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default accountReducer;
