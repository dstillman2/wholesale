const notFound404Handler = {
  get(req, res) {
    res.status(404).send('404 Not Found');
  },
};

export default notFound404Handler;
