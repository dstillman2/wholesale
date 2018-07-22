import pool from '../config/mysql.config';

function createActivity({ accountId, userId, action, data }) {
  pool.query(
    `
      INSERT INTO activities
      SET ?
    `,
    {
      account_id: accountId,
      user_id: userId,
      action,
      data,
      created_at: new Date(),
    },
  );
}

export default createActivity;
