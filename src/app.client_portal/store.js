import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import rootReducer from './reducers/root_reducer';

const defaultStore = {
  settings: window.orderNimbusSettings,
};

const store = createStore(
  rootReducer,
  defaultStore,
  applyMiddleware(thunk),
);

if (window.NODE_ENV !== 'production') {
  window.store = store;
}

export default store;
