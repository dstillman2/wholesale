function staffReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_STAFF_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_STAFF_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default staffReducer;
