import redis from '../config/redis.config';

const logoutHandler = {
  get(req, res) {
    const sessionId = req.signedCookies.st;

    redis.del(`nimbus:${sessionId}:session`, (error) => {
      if (error) {
        res.status(500).json({ error });

        return;
      }

      res.clearCookie('st');

      res.redirect('/login');
    });
  },
};

export default logoutHandler;
