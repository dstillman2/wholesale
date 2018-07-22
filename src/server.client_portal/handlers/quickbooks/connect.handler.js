import Tokens from 'csrf';
import ClientOAuth2 from 'client-oauth2';
import redis from '../../config/redis.config';
import getQbConfigs from '../../config/qb.config';

const csrf = new Tokens();

const connectHandler = {
  get(req, res) {
    const accountId = req.user.accountId;

    const secret = csrf.secretSync();
    const token = csrf.create(secret);

    getQbConfigs((error, configs) => {
      if (error) {
        res.status(500).send('Failed. Please try again.');

        return;
      }

      redis.setex(token, 5000, JSON.stringify({
        secret,
        accountId,
      }), (redisError) => {
        if (redisError) {
          res.status(500).send('db error');

          return;
        }

        const intuitAuth = new ClientOAuth2(configs);

        const uri = intuitAuth.code.getUri({ state: token });

        res.redirect(uri);
      });
    });
  },
};

export default connectHandler;
