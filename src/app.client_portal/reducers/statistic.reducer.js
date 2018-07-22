function statisticReducer(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_STATISTIC_DATA':
      return Object.assign({}, state, { data: action.value.data });

    default:
      return state;
  }
}

export default statisticReducer;
