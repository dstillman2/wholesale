import pool from '../config/mysql.config';

function fetchClient(req, res, next) {
  if (req.originalUrl.includes('vendor/assets')) {
    next();

    return;
  }

  let query = (
    `
      SELECT * FROM accounts
      WHERE is_deleted = 0
      AND domain = ?
      LIMIT 1
    `
  );

  let domain = req.headers.host;

  if (domain.includes('ordernimbus.com')) {
    domain = req.headers.host.split('.')[0];

    query = (
      `
        SELECT * FROM accounts
        WHERE is_deleted = 0
        AND subdomain = ?
        LIMIT 1
      `
    );
  }

  pool.query(
    query,
    [domain],
    (mysqlError, mysqlReply) => {
      if (mysqlError) {
        res.status(500).send('Internal Server Error');
      } else if (mysqlReply.length !== 1) {
        res.status(401).send('Unauthorized');
      } else {
        req.account = mysqlReply[0];

        next();
      }
    },
  );
}

export default fetchClient;
