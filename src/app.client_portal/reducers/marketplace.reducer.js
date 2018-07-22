function marketplaceReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_MARKETPLACE_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_MARKETPLACE_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default marketplaceReducer;
