import createSearchQuery from './search_query';

function getEntries(accountId, table, id, parameters = {}, joins = []) {
  // account for join clause
  let sqlJoinTables = '';
  let sqlJoinColumns = '';
  let sqlJoinWhereClause = '';

  if (Array.isArray(joins)) {
    joins.forEach((join) => {
      sqlJoinTables = `,${join.table}${sqlJoinTables}`;

      join.columns.forEach((column) => {
        sqlJoinColumns = `,${join.table}.${column}${sqlJoinColumns}`;
      });

      sqlJoinWhereClause = `AND ${table}.${join.with} = ${join.table}.${join.on}`;
    });
  }

  let sqlIdsSelector = '';

  // account for multiple ids
  if (Array.isArray(id)) {
    sqlIdsSelector = `AND ${table}.id IN (${id.join(' ')})`;
  } else if (id) {
    sqlIdsSelector = `AND ${table}.id=${id}`;
  }

  let sqlOrderBy = '';

  if (parameters.column && parameters.direction) {
    sqlOrderBy = `${parameters.column} ${parameters.direction}`;
  } else {
    sqlOrderBy = 'created_at DESC';
  }

  // if parameters.where array present
  let sqlWhereClause = '';

  if (parameters.where) {
    Object.entries(parameters.where).forEach(([key, value]) => {
      sqlWhereClause = `AND ${key}=${typeof value === 'string' ? `"${value}"` : value}`;
    });
  }

  return `
    SELECT ${table}.*${sqlJoinColumns} FROM ${table}${sqlJoinTables}
    WHERE (
      ${table}.account_id=${accountId}
      ${sqlIdsSelector}
      ${sqlWhereClause}
      AND ${table}.is_deleted=0
      ${sqlJoinWhereClause}
      ${createSearchQuery(parameters.search, parameters.searchColumns)}
    )
    ORDER BY ${sqlOrderBy}
    ${parameters.limit ? `LIMIT ${parameters.limit}` : ''}
    ${parameters.offset ? `OFFSET ${parameters.offset}` : ''}
  `;
}

export default getEntries;
