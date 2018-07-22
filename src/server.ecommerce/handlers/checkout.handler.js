const checkoutHandler = {
  get(req, res) {
    res.render('default/checkout', {
      pageTitle: 'Checkout',
      pageInfo: req.pageInfo,
      customer: req.customer,
      logoFilePath: req.logoFilePath,
      account: req.account,
      categories: req.categories,
      isLoggedIn: true,
      marketplace: req.marketplaceSettings,
      isDemo: process.env.NODE_ENV !== 'production',
    });
  },
};

export default checkoutHandler;
