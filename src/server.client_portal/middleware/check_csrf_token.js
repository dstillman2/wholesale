import redis from '../config/redis.config';

function checkCsrfToken(req, res, next) {
  const sessionToken = req.signedCookies.st;

  redis.get(`nimbus:${sessionToken}:session`, (redisError, redisReply) => {
    if (redisError) {
      res.status(500).end();

      return;
    }

    const data = JSON.parse(redisReply);

    if (req.method === 'GET') {
      next();
    } else if (req.body.csrfToken === data.csrfToken) {
      next();
    } else {
      res.status(500).json({ data: { error: 'invalid csrf token' } });
    }
  });
}

export default checkCsrfToken;
