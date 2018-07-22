import React from 'react';
import StaffCreate from './settings.create.staff';

class SettingsEditStaff extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <StaffCreate
        isEditing
      />
    );
  }
}

export default SettingsEditStaff;
