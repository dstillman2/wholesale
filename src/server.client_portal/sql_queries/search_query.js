function searchQuery(query, columns) {
  if (!query) {
    return '';
  }

  const searchQueryList = query.split(' ');

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

export default searchQuery;
