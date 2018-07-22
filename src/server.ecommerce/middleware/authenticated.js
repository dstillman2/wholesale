function authenticated(req, res, next) {
  const isXhr = req.headers['x-requested-with'] === 'xhr';

  if (!req.isAuthenticated && isXhr) {
    res.redirect('/sign-in');
  } else if (!req.isAuthenticated) {
    res.redirect('/sign-in');
  } else {
    next();
  }
}

export default authenticated;
