import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import QuickBooks from './settings.edit.quickbooks';

class SettingsIntegrations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onClickEdit = this.onClickEdit.bind(this);
  }

  onClickEdit(str) {
    switch (str) {
      case 'quickbooks':
        this.setState({
          isCompanyPanelOpen: true,
          isUserPanelOpen: false,
          isPasswordPanelOpen: false,
        });

        break;
      default:
    }
  }

  render() {
    return (
      <div className="container nimbus-form">
        <div className="row">
          <div className="col-md-7">
            <QuickBooks
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isCompanyPanelOpen}
              {...this.props}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect()(SettingsIntegrations));
