import { combineReducers } from 'redux';
import secondaryHeader from './secondary_header.reducer';
import products from './product.reducer';
import marketplace from './marketplace.reducer';
import settings from './settings.reducer';
import customers from './customer.reducer';
import orders from './order.reducer';
import statistics from './statistic.reducer';
import account from './account.reducer';
import user from './user.reducer';
import staff from './staff.reducer';
import category from './category.reducer';

export default combineReducers({
  secondaryHeader,
  products,
  marketplace,
  customers,
  category,
  settings,
  orders,
  account,
  user,
  staff,
  statistics,
});
