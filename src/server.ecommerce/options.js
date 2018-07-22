const PORT = process.env.PORT || 3555;
const NIMBUS_API_KEY = process.env.NIMBUS_API_KEY;
const NIMBUS_HOST = process.env.NIMBUS_HOST;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PRODUCTION = process.env.NODE_ENV === 'production';
const BUCKET = process.env.BUCKET || 'nimbuscp';
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_DB = process.env.MYSQL_DB;

export {
  PORT,
  NIMBUS_API_KEY,
  NIMBUS_HOST,
  COOKIE_SECRET,
  SENDGRID_API_KEY,
  GOOGLE_API_KEY,
  PRODUCTION,
  PRODUCTION as IS_PRODUCTION,
  BUCKET,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DB,
};
