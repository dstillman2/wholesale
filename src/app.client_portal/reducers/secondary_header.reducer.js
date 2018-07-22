function secondaryHeaderReducer(state = {}, action) {
  switch (action.type) {
    case 'HEADER_2_UPDATE_STATE':
      return Object.assign({}, state);

    default:
      return state;
  }
}

export default secondaryHeaderReducer;
