import path from 'path';

import mustacheExpress from 'mustache-express';

import { app, http, createRouter } from './config/app.config';
import { PORT } from './options';
import * as handlers from './handlers';
import middleware, { authenticated, fetchProducts, routeIfAuthenticated } from './middleware';
import registerRoutes from './lib/registerRoutes';

import log from '../shared/util/logging';

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

const router = createRouter();
const authRouter = createRouter();
const embedRouter = createRouter();

middleware(app);

const applicationRoutes = [
  ['/products/:productId', handlers.productHandler],
  ['/category/:categoryName', handlers.categoryHandler],
  ['/category/:categoryName/:subCategoryName', handlers.categoryHandler],
  ['/images/:fileName', handlers.imageHandler],
  ['/sign-up', handlers.signupHandler, [routeIfAuthenticated]],
  ['/sign-in', handlers.signinHandler, [routeIfAuthenticated]],
  ['/forgot-password', handlers.forgotPasswordHandler, [routeIfAuthenticated]],
  ['/reset-password', handlers.resetPasswordHandler, [routeIfAuthenticated]],
  ['/contact', handlers.contactHandler],
  ['/', handlers.mainHandler],
];

registerRoutes(router, applicationRoutes, [fetchProducts]);

app.use('/', router);

const authAppRoutes = [
  ['/', handlers.myAccountHandler],
  ['/cart', handlers.cartHandler],
  ['/orders', handlers.orderHandler],
  ['/orders/:orderId', handlers.orderHandler],
  ['/invoices/:orderId', handlers.invoiceHandler],
  ['/checkout', handlers.checkoutHandler],
  ['/settings', handlers.myAccountHandler],
  ['/logout', handlers.logoutHandler],
];

registerRoutes(authRouter, authAppRoutes, [fetchProducts, authenticated]);

app.use('/account', authRouter);

const embedRoutes = [
  ['/', handlers.embedShopHandler],
];

registerRoutes(embedRouter, embedRoutes);

app.use('/shop', embedRouter);

http.listen(PORT, () => {
  log(`listening on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  log(error);
  process.exit(1);
});
