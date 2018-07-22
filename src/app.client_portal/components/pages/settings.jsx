import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import Header from '../pages.components/header';
import SecondaryHeader from '../pages.components/secondary_header';
import Footer from '../pages.components/footer';

import StaffView from '../pages.views/settings.view.staff';
import StaffCreate from '../pages.views/settings.create.staff';
import StaffEdit from '../pages.views/settings.edit.staff';

import AccountEdit from '../pages.views/settings.edit.account';

import Integrations from '../pages.views/settings.edit.integrations';

class Settings extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    const links = [
      {
        title: 'My Account',
        href: '/account/settings',
        isExactMatch: true,
      },
      {
        title: 'Staff',
        href: '/account/settings/staff',
        permissions: window.orderNimbusSettings.permissions.isAdministrator,
      },
      {
        title: 'Integrations',
        href: '/account/settings/integrations',
        permissions: window.orderNimbusSettings.permissions.isAdministrator,
      },
    ];

    return (
      <div id="settings">
        <Header />
        <main className="main-container">
          <SecondaryHeader
            links={links}
          />
          <div className="main-content">
            <Route exact path="/account/settings/staff" component={StaffView} />
            <Route exact path="/account/settings/staff/create" component={StaffCreate} />
            <Route exact path="/account/settings/staff/edit/:id" component={StaffEdit} />
            <Route exact path="/account/settings" component={AccountEdit} />
            <Route exact path="/account/settings/integrations" component={Integrations} />
          </div>
          <Footer />
        </main>
      </div>
    );
  }
}

export default withRouter(connect(state => state)(Settings));
