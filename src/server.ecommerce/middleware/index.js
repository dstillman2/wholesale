import path from 'path';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import bodyParser from 'body-parser';
import fetchClient from './fetch_client';
import fetchCustomer from './fetch_customer';
import authenticated from './authenticated';
import fetchProducts from './fetch_products';
import setPageInfo from './set_page_info';
import { COOKIE_SECRET, IS_PRODUCTION } from '../options';
import routeIfAuthenticated from './routeIfAuthenticated';
import logging from './logging';

const staticOptions = {
  setHeaders: (res) => {
    if (IS_PRODUCTION) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  },
};

function middleware(app) {
  app.use(helmet());

  if (process.env.NODE_ENV !== 'production') {
    app.use(logging);
  }

  app.use('/vendor/assets', express.static(path.join(__dirname, '../static/vendor/default'), staticOptions));
  app.use('/css', express.static(path.join(__dirname, '../static/css'), staticOptions));
  app.use('/js', express.static(path.join(__dirname, '../static/js'), staticOptions));
  app.use('/img', express.static(path.join(__dirname, '../static/img'), staticOptions));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(COOKIE_SECRET));

  app.use(fetchClient);
  app.use(fetchCustomer);
  app.use(setPageInfo);
}

export default middleware;

export {
  fetchProducts,
  authenticated,
  routeIfAuthenticated,
};
