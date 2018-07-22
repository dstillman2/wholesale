function setPageInfo(req, res, next) {
  req.pageInfo = {
    currentYear: new Date().getFullYear(),
  };

  next();
}

export default setPageInfo;
