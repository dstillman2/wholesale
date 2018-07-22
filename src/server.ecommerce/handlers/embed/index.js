const embedShopHandler = {
  get(req, res) {
    res.render('embed', {
      isDemo: process.env.NODE_ENV === 'production',
    });
  },
};

export default embedShopHandler;
