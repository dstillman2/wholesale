const cartHandler = {
  get(req, res) {
    res.render('default/cart', {
      pageTitle: 'Cart',
      pageInfo: req.pageInfo,
      customer: req.customer,
      account: req.account,
      logoFilePath: req.logoFilePath,
      categories: req.categories,
      isLoggedIn: true,
      isDemo: process.env.NODE_ENV !== 'production',
    });
  },
};

export default cartHandler;
