import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TableWidget from '../widgets/table';
import defaultSchema from '../../schemas/tables/staff.default';

class SettingsViewStaff extends React.Component {
  render() {
    return (
      <div className="container">
        <TableWidget
          {...this.props}
          schema={defaultSchema.call(this)}
        >
          <div className="row">
            <div className="col-md-12">
              <button
                className="btn btn-secondary mr-10 btn-secondary-v3"
                style={{ textTransform: 'none' }}
                onClick={() => {
                  this.props.history.push({
                    pathname: '/account/settings/staff/create',
                  });
                }}
              >
                Create Staff Member
              </button>
            </div>
          </div>
        </TableWidget>
      </div>
    );
  }
}

export default withRouter(connect()(SettingsViewStaff));
