function checkIfXhr(req, res, next) {
  if (req.headers['x-requested-with'] === 'xhr') {
    next();
  } else {
    res.status(404).send('Unauthorized access to resource');
  }
}

export default checkIfXhr;
