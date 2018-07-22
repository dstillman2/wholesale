import { GOOGLE_API_KEY } from '../options';

const mainHandler = {
  get(req, res) {
    const a = req.account;

    res.render('default/home', {
      pageTitle: 'Home',
      pageInfo: req.pageInfo,
      account: req.account,
      isLoggedIn: req.isAuthenticated,
      categories: req.categories,
      logoFilePath: req.logoFilePath,
      bestSellers: req.bestSellers,
      googleApiKey: GOOGLE_API_KEY,
      googleMapsSearchQuery: global.encodeURIComponent(`${a.address_1} ${a.address_2}, ${a.city} ${a.state}, ${a.zip_code}`),
      isDemo: process.env.NODE_ENV !== 'production',
    });
  },
};

export default mainHandler;
