const PORT = process.env.PORT || 5959;
const NODE_ENV = process.env.NODE_ENV || 'development';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'test';
const BUCKET = process.env.BUCKET || 'nimbuscp';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_DB = process.env.MYSQL_DB;
const QB_CLIENT_ID = process.env.QB_CLIENT_ID;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET;
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI;

export {
  PORT,
  NODE_ENV,
  COOKIE_SECRET,
  BUCKET,
  SENDGRID_API_KEY,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DB,
  QB_CLIENT_ID,
  QB_CLIENT_SECRET,
  QB_REDIRECT_URI,
};

export default {
  PORT,
  NODE_ENV,
  COOKIE_SECRET,
  BUCKET,
  SENDGRID_API_KEY,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DB,
  QB_CLIENT_ID,
  QB_CLIENT_SECRET,
  QB_REDIRECT_URI,
};
