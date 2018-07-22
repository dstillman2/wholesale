import redis from '../config/redis.config';

const logoutHandler = {
  get(req, res) {
    const sessionId = req.signedCookies.ecom;

    redis.del(`nimbus:${sessionId}:session`, (error) => {
      if (error) {
        res.status(500).json({ error });

        return;
      }

      res.redirect('/');
    });
  },
};

export default logoutHandler;
