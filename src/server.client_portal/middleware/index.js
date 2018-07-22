import path from 'path';
import mustacheExpress from 'mustache-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import bodyParser from 'body-parser';
import { NODE_ENV, COOKIE_SECRET } from '../options';
import authenticated from './authenticated';
import checkIfAuthenticated from './is_authenticated';
import checkIfXhr from './check_if_xhr';
import logging from './logging';
import checkCsrfToken from './check_csrf_token';

function middleware(app) {
  app.engine('mustache', mustacheExpress());

  app.set('view engine', 'mustache');
  app.set('views', path.join(__dirname, '../views'));

  app.use(logging);
  app.use(helmet());

  const options = {
    etag: false,

    setHeaders: (res) => {
      if (NODE_ENV === 'production') {
        res.setHeader('Cache-Control', 'private, max-age=86400');
      }
    },
  };

  app.use('/static/css', express.static(path.join(__dirname, '../static/css'), options));
  app.use('/static/images', express.static(path.join(__dirname, '../static/img'), options));
  app.use('/static/js', express.static(path.join(__dirname, '../static/js'), options));
  app.use('/static/assets', express.static(path.join(__dirname, '../static/vendor/assets'), options));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(COOKIE_SECRET));
}

export {
  authenticated,
  checkIfAuthenticated,
  checkIfXhr,
  checkCsrfToken,
};

export default middleware;
