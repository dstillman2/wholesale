import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import Header from '../pages.components/header';
import SecondaryHeader from '../pages.components/secondary_header';
import Footer from '../pages.components/footer';
import View from '../pages.views/marketplace.view';
import Theme from '../pages.views/marketplace.theme';
import Emails from '../pages.views/marketplace.emails';

const links = [
  {
    title: 'Theme Settings',
    href: '/account/marketplace',
    isExactMatch: true,
  },
  {
    title: 'Payment Methods',
    href: '/account/marketplace/billing',
    isExactMatch: true,
  },
  {
    title: 'Email Notifications',
    href: '/account/marketplace/emails',
    isExactMatch: true,
  },
];

class Marketplace extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <div id="marketplace">
        <Header />
        <main className="main-container">
          <SecondaryHeader links={links} />
          <div className="main-content">
            <Route exact path="/account/marketplace" component={Theme} />
            <Route exact path="/account/marketplace/billing" component={View} />
            <Route exact path="/account/marketplace/emails" component={Emails} />
          </div>
          <Footer />
        </main>
      </div>
    );
  }
}

export default withRouter(connect()(Marketplace));
