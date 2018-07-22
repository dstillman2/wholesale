import Tokens from 'csrf';
import ClientOAuth2 from 'client-oauth2';

import redis from '../../config/redis.config';
import mysql from '../../config/mysql.config';
import getQbConfigs from '../../config/qb.config';

const csrf = new Tokens();

const callbackHandler = {
  get(req, res) {
    redis.get(
      req.query.state,
      (redisError, redisReply) => {
        if (redisError) {
          res.status(500).send('db error');

          return;
        }

        const reply = JSON.parse(redisReply);
        const accountId = reply.accountId;
        const secret = reply.secret;

        if (!csrf.verify(secret, req.query.state)) {
          res.status(400).send('Invalid anti-forgery CSRF response');

          return;
        }

        getQbConfigs((error, configs) => {
          if (error) {
            res.status(500).send('Failed. Please try again.');

            return;
          }

          const intuitAuth = new ClientOAuth2(configs);

          // Exchange auth code for access token
          intuitAuth.code.getToken(req.originalUrl).then((token) => {
            const params = {
              accessToken: token.accessToken,
              refreshToken: token.refreshToken,
              tokenType: token.tokenType,
              data: token.data,
            };

            mysql.query(
              `
                UPDATE accounts
                SET ?
                WHERE id = ?
                AND is_deleted = 0
              `,
              [
                {
                  qb_token: JSON.stringify(params),
                  qb_realm_id: req.query.realmId,
                  is_qb_enabled: 1,
                }, accountId],
              (mysqlError) => {
                if (mysqlError) {
                  res.status(500).send('mysql error');

                  return;
                }

                res.send(
                  `
                    <div>Successfully connected to QuickBooks.</div>
                    <script type="text/javascript">
                      window.close();
                    </script>
                  `,
                );
              },
            );
          }).catch(() => {
            res.status(500).send('Failed to connect to Quickbooks');
          });
        });
      },
    );
  },
};

export default callbackHandler;
