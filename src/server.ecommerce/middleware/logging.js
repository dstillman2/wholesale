'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _options = require('../options');

function logging(req, res, next) {
  if (_options.NODE_ENV !== 'production') {
    console.log('%s: %s  %s', req.method, req.path, req.headers.referer);
  }

  next();
}

exports.default = logging;