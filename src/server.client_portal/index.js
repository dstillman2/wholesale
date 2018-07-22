import { app, http, createRouter } from './config/app.config';
import { PORT, NODE_ENV } from './options';
import registerRoutes from './lib/register_routes';
import * as handlers from './handlers';
import middleware, {
  authenticated,
  checkIfAuthenticated,
  checkIfXhr,
  checkCsrfToken,
} from './middleware';

middleware(app);

const viewsNoAuthRouter = createRouter();
const viewsAuthRouter = createRouter();
const apiNoAuthRouter = createRouter();
const apiAuthRouter = createRouter();

const viewsNoAuthRoutes = [
  ['/login', handlers.loginHandler],
  ['/register', handlers.loginHandler],
  ['/forgot-password', handlers.loginHandler],
  ['/reset-password', handlers.loginHandler],
  ['/', handlers.redirect('/account/dashboard')],
];

const viewsAuthRoutes = [
  ['/', handlers.redirect('/account/dashboard')],
  ['/logout', handlers.logoutHandler],
  ['/dashboard', handlers.mainHandler],
  ['/customers', handlers.mainHandler],
  ['/customers/create', handlers.mainHandler],
  ['/customers/edit/:customerId', handlers.mainHandler],
  ['/orders', handlers.mainHandler],
  ['/orders/create', handlers.mainHandler],
  ['/orders/edit/:orderId', handlers.mainHandler],
  ['/products', handlers.mainHandler],
  ['/products/create', handlers.mainHandler],
  ['/products/categories', handlers.mainHandler],
  ['/products/edit/:productId', handlers.mainHandler],
  ['/marketplace', handlers.mainHandler],
  ['/marketplace/billing', handlers.mainHandler],
  ['/marketplace/emails', handlers.mainHandler],
  ['/settings', handlers.mainHandler],
  ['/settings/account', handlers.mainHandler],
  ['/settings/staff', handlers.mainHandler],
  ['/settings/staff/create', handlers.mainHandler],
  ['/settings/staff/edit/:staffId', handlers.mainHandler],
  ['/settings/company', handlers.mainHandler],
  ['/settings/user', handlers.mainHandler],
  ['/settings/integrations', handlers.mainHandler],
  [/.*/, handlers.notFound404Handler],
];

const apiNoAuthRoutes = [
  ['/accounts', handlers.createAccountHandler],
  ['/forgot-password', handlers.forgotPasswordHandler],
  ['/reset-password', handlers.resetPasswordHandler],
  ['/quickbooks/callback', handlers.qbCallbackHandler],
];

const apiAuthRoutes = [
  ['/images(/:fileName)?', handlers.imageHandler],
  ['/invoices/:orderId', handlers.invoiceHandler],
  ['/accounts', handlers.accountHandler, [checkIfXhr, checkCsrfToken]],
  ['/statistics', handlers.statisticHandler, [checkIfXhr, checkCsrfToken]],
  ['/users', handlers.userHandler, [checkIfXhr, checkCsrfToken]],
  ['/marketplace', handlers.marketplaceHandler, [checkIfXhr, checkCsrfToken]],
  ['/user/password', handlers.userPasswordHandler, [checkIfXhr, checkCsrfToken]],
  ['/products/upload', handlers.imageUploadHandler, [checkIfXhr]],
  ['/products/inventory(/:productId)?', handlers.productInventoryHandler, [checkIfXhr]],
  ['/products(/:productId)?', handlers.productHandler, [checkIfXhr, checkCsrfToken]],
  ['/categories(/:categoryId)?', handlers.productCategoryHandler, [checkIfXhr, checkCsrfToken]],
  ['/customers(/:customerId)?', handlers.customerHandler, [checkIfXhr, checkCsrfToken]],
  ['/orders/export', handlers.orderExcelHandler],
  ['/orders(/:orderId)?', handlers.orderHandler, [checkIfXhr, checkCsrfToken]],
  ['/staff(/:staffId)?', handlers.staffHandler, [checkIfXhr, checkCsrfToken]],
  ['/quickbooks/connect', handlers.qbConnectHandler],
  ['/quickbooks/sync', handlers.qbSyncHandler],
  [/.*/, handlers.notFound404Handler],
];

registerRoutes(viewsNoAuthRouter, viewsNoAuthRoutes, [checkIfAuthenticated]);
registerRoutes(viewsAuthRouter, viewsAuthRoutes, [authenticated]);
registerRoutes(apiNoAuthRouter, apiNoAuthRoutes);
registerRoutes(apiAuthRouter, apiAuthRoutes, [authenticated]);

app.use('/', viewsNoAuthRouter);
app.use('/account', viewsAuthRouter);
app.use('/api', apiNoAuthRouter);
app.use('/api', apiAuthRouter);

http.listen(PORT, () => {
  if (NODE_ENV !== 'production') {
    console.log('listening on port %s', PORT);
  }
});
