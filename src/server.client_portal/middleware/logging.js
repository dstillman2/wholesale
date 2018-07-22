import { NODE_ENV } from '../options';

function logging(req, res, next) {
  if (NODE_ENV !== 'production') {
    console.log('%s: %s  %s', req.method, req.path, req.headers.referer);
  }

  next();
}

export default logging;
