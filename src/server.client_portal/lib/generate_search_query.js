function generateSearchQuery(searchQuery, columns) {
  if (!searchQuery) {
    return '';
  }

  const searchQueryList = searchQuery.split(' ');

  let str = '';

  columns.forEach((column) => {
    searchQueryList.filter(val => !!val).forEach((word) => {
      if (!str) {
        str += (
          `
            ${column} LIKE "%${word}%"
          `
        );
      } else {
        str += (
          `
            OR ${column} LIKE "%${word}%"
          `
        );
      }
    });
  });

  return (
    `
      AND (
        ${str}
      )
    `
  );
}

export default generateSearchQuery;
