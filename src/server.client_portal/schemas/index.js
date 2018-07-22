import { dump } from '../lib/util.schemas';

import Products from './products';
import Accounts from './accounts';
import Users from './users';
import Customers from './customers';
import Orders from './orders';
import Purchases from './purchases';
import Staff from './staff';
import ProductCategories from './product_categories';
import Marketplace from './marketplace';

const schemas = {
  Accounts,
  Products,
  Users,
  Customers,
  Orders,
  Purchases,
  OrderItems: Purchases,
  Staff,
  ProductCategories,
  Marketplace,
};

export default dump(schemas);
