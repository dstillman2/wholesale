function routeIfAuthenticated(req, res, next) {
  const isXhr = req.headers['x-requested-with'] === 'xhr';

  if (req.isAuthenticated && !isXhr) {
    res.redirect('/account');

    return;
  }

  next();
}

export default routeIfAuthenticated;
