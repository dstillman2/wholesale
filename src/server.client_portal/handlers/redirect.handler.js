const redirectHandler = path => (
  {
    get(req, res) {
      res.redirect(path);
    },
  }
);

export default redirectHandler;
