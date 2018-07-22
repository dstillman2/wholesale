import { validateParameters } from '../lib/util.validations';

import users from './users';
import accounts from './accounts';
import products from './products';

const fields = {
  users,
  accounts,
  products,
};

export default validateParameters(fields);
