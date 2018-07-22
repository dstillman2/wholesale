import React from 'react';
import Button from '../../components/widgets/button';

const defaultSchema = function defaultSchema() {
  return {
    createButtons: [
      {
        name: 'Create Staff Member',
        location: '/account/settings/staff/create',
      },
    ],

    editPath: '/account/settings/staff/edit',

    xhr: {
      select: 'fetchStaff',
    },

    heading: [
      {
        name: 'Username',
      },
      {
        name: 'Name',
      },
      {
        name: 'Permissions',
      },
      {
        name: 'Status',
      },
    ],

    new: (
      <div className="text-center">
        <h4
          className="mb-50"
        >
          No staff member accounts have been created.
        </h4>
        <Button
          name="Create a Staff Member"
          onClick={() => {
            this.props.history.push({ pathname: '/account/settings/staff/create' });
          }}
          isInlineBlock
        />
      </div>
    ),

    body: [
      data => data.username,
      data => `${data.first_name[0]}. ${data.last_name}`,
      (data) => {
        if (!data.permissions || typeof data.permissions !== 'string') {
          return false;
        }

        const permissions = JSON.parse(data.permissions);

        const hasWriteCapability = Object.values(permissions.write).reduce((a, b) => {
          if (a === true) {
            return true;
          } else if (b === true) {
            return true;
          }

          return false;
        }, false);

        const badge = name => (
          <span className="badge badge-secondary text-uppercase no-radius ls-1 mr-10">
            {name}
          </span>
        );

        return (
          <div>
            {badge('read')}
            {hasWriteCapability && badge('write')}
            {permissions.isAdministrator && badge('administrator')}
          </div>
        );
      },
      data => (data.is_active ? (
        <span className="badge badge-secondary text-uppercase no-radius ls-1">Active</span>
      ) : (
        <span className="badge badge-secondary text-uppercase no-radius ls-1">Inactive</span>
      )),
    ],
  };
};

export default defaultSchema;
