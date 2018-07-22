import React from 'react';
import SettingsPassword from './settings.edit.password';
import SettingsCompany from './settings.edit.company';
import settingsUserConfigs from '../../schemas/fieldsets/settings.edit.user';
import EditPanel from '../widgets/edit_panel';

class SettingsMyAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onClickEdit = this.onClickEdit.bind(this);
  }

  onClickEdit(str) {
    switch (str) {
      case 'company':
        this.setState({
          isCompanyPanelOpen: true,
          isUserPanelOpen: false,
          isPasswordPanelOpen: false,
        });

        break;
      case 'user':
        this.setState({
          isCompanyPanelOpen: false,
          isUserPanelOpen: true,
          isPasswordPanelOpen: false,
        });

        break;
      case 'password':
        this.setState({
          isCompanyPanelOpen: false,
          isUserPanelOpen: false,
          isPasswordPanelOpen: true,
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
            <SettingsCompany
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isCompanyPanelOpen}
              {...this.props}
            />
            <EditPanel
              configs={settingsUserConfigs}
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isUserPanelOpen}
              {...this.props}
            />
          </div>
          <div className="col-md-5">
            <SettingsPassword
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isPasswordPanelOpen}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsMyAccount;
