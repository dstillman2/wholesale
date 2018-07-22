import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import Header from '../pages.components/header';
import SecondaryHeader from '../pages.components/secondary_header';
import View from '../pages.views/customers.view';
import Create from '../pages.views/customers.create';
import Edit from '../pages.views/customers.edit';
import Footer from '../pages.components/footer';

class Customers extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    let name = 'Loading..';

    if (this.props.data) {
      name = `${this.props.data.first_name[0]}. ${this.props.data.last_name}`;
    }

    const links = [
      {
        title: 'All Customers',
        href: '/account/customers',
        isExactMatch: true,
        permissions: window.orderNimbusSettings.permissions.read.customers,
      },
      {
        title: 'Add Customer',
        href: '/account/customers/create',
        isExactMatch: true,
        permissions: window.orderNimbusSettings.permissions.write.customers,
      },
      {
        title: `${name}`,
        href: '/account/customers/edit',
        isShownOnlyIfMatched: true,
        hasNoLink: true,
        permissions: window.orderNimbusSettings.permissions.read.customers,
      },
    ];

    return (
      <div id="messages-panel">
        <Header />
        <main className="main-container">
          <SecondaryHeader links={links} />
          <div className="main-content">
            <Route exact path="/account/customers" component={View} />
            <Route exact path="/account/customers/create" component={Create} />
            <Route exact path="/account/customers/edit/:id" component={Edit} />
          </div>
          <Footer />
        </main>
      </div>
    );
  }
}

export default withRouter(connect(state => state.customers)(Customers));
