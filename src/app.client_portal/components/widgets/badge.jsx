import React from 'react';

const badgeEnabled = value => <span className="badge badge-primary text-uppercase no-radius ls-1">{value}</span>;
const badge = value => <span className="badge badge-secondary text-uppercase no-radius ls-1">{value}</span>;

export {
  badgeEnabled,
  badge as badgeDisabled,
  badge,
};
