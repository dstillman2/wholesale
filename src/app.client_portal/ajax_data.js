const ajaxData = {
  fetchStatistics: { path: '/api/statistics', method: 'GET' },

  fetchAccount: { path: '/api/accounts', method: 'GET' },
  createAccount: { path: '/api/accounts', method: 'POST' },
  updateAccount: { path: '/api/accounts', method: 'PUT' },

  fetchUser: { path: '/api/users', method: 'GET' },
  updateUser: { path: '/api/users', method: 'PUT' },

  updatePassword: { path: '/api/user/password', method: 'PUT' },

  fetchProduct: { path: '/api/products', method: 'GET' },
  createProduct: { path: '/api/products', method: 'POST' },
  updateProduct: { path: '/api/products', method: 'PUT' },
  uploadProduct: { path: '/api/products/upload', method: 'POST' },
  deleteProduct: { path: '/api/products', method: 'DELETE' },

  updateProductInventory: { path: '/api/products/inventory', method: 'PUT' },

  fetchCategory: { path: '/api/categories', method: 'GET' },
  createCategory: { path: '/api/categories', method: 'POST' },
  updateCategory: { path: '/api/categories', method: 'PUT' },
  deleteCategory: { path: '/api/categories', method: 'DELETE' },

  fetchOrder: { path: '/api/orders', method: 'GET' },
  fetchOrderExport: { path: '/api/orders/export', method: 'GET' },
  createOrder: { path: '/api/orders', method: 'POST' },
  updateOrder: { path: '/api/orders', method: 'PUT' },
  deleteOrder: { path: '/api/orders', method: 'DELETE' },

  fetchCustomer: { path: '/api/customers', method: 'GET' },
  createCustomer: { path: '/api/customers', method: 'POST' },
  updateCustomer: { path: '/api/customers', method: 'PUT' },
  deleteCustomer: { path: '/api/customers', method: 'DELETE' },

  fetchStaff: { path: '/api/staff', method: 'GET' },
  createStaff: { path: '/api/staff', method: 'POST' },
  updateStaff: { path: '/api/staff', method: 'PUT' },
  deleteStaff: { path: '/api/staff', method: 'DELETE' },

  fetchMarketplace: { path: '/api/marketplace', method: 'GET' },
  updateMarketplace: { path: '/api/marketplace', method: 'PUT' },

  updateUserPassword: { path: '/api/user/password', method: 'PUT' },
  postLogin: { path: '/login', method: 'POST' },
  postForgotPassword: { path: '/api/forgot-password', method: 'POST' },
  postResetPassword: { path: '/api/reset-password', method: 'POST' },

  quickbooksPostSync: { path: '/api/quickbooks/sync', method: 'POST' },
};

export default ajaxData;
