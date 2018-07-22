import createSearchQuery from './search_query';

function getTotalCount(accountId, table, parameters = {}, joins = []) {
  // account for join clause
  let sqlJoinTables = '';
  let sqlJoinColumns = '';
  let sqlJoinWhereClause = '';
  const tables = [];

  if (Array.isArray(joins)) {
    joins.forEach((join) => {
      sqlJoinTables = `,${join.table}${sqlJoinTables}`;
      tables.push(join.table);

      join.columns.forEach((column) => {
        sqlJoinColumns = `,${join.table}.${column}${sqlJoinColumns}`;
      });

      sqlJoinWhereClause = `AND ${table}.${join.with} = ${join.table}.${join.on}`;
    });
  }

  // if parameters.where array present
  let sqlWhereClause = '';

  if (parameters.where) {
    Object.entries(parameters.where).forEach(([key, value]) => {
      sqlWhereClause = `AND ${key}=${typeof value === 'string' ? `"${value}"` : value}`;
    });
  }

  return `
    SELECT COUNT(*) FROM ${table} ${tables.length > 0 ? `,${tables.join(',')}` : ''}
    WHERE (
      ${table}.account_id=${accountId}
      ${sqlWhereClause}
      AND ${table}.is_deleted=0
      ${sqlJoinWhereClause}
      ${createSearchQuery(parameters.search, parameters.searchColumns)}
    )
  `;
}

export default getTotalCount;
