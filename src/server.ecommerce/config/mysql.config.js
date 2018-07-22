import mysql from 'mysql';

import { MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER, MYSQL_DB } from '../options';

const pool = mysql.createPool({
  connectionLimit: 10,
  host: MYSQL_HOST || 'localhost',
  user: MYSQL_USER || 'root',
  password: MYSQL_PASSWORD || 'mysql',
  database: MYSQL_DB || 'db1',
});

export default pool;
