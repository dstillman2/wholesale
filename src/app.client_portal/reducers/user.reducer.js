function userReducer(state = {}, action) {
  switch (action.type) {
    case 'FORCE_UPDATE_USER_PROPS':
      return Object.assign({}, state, { forceUpdate: Math.random() });

    case 'UPDATE_USER_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default userReducer;
