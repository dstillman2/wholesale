import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import Header from '../pages.components/header';
import SecondaryHeader from '../pages.components/secondary_header';
import Footer from '../pages.components/footer';
import Create from '../pages.views/orders.create';
import View from '../pages.views/orders.view';
import Edit from '../pages.views/orders.edit';

class Orders extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    let name = 'Loading..';

    if (this.props.data) {
      name = `Order #${this.props.data.id}`;
    }

    const links = [
      {
        title: 'All Orders',
        href: '/account/orders',
        isExactMatch: true,
        permissions: window.orderNimbusSettings.permissions.read.orders,
      },
      {
        title: 'Add Order',
        href: '/account/orders/create',
        isExactMatch: true,
        permissions: window.orderNimbusSettings.permissions.write.orders,
      },
      {
        title: `${name}`,
        href: '/account/orders/edit',
        isShownOnlyIfMatched: true,
        hasNoLink: true,
        permissions: window.orderNimbusSettings.permissions.read.orders,
      },
    ];

    return (
      <div id="orders">
        <Header />
        <main className="main-container">
          <SecondaryHeader
            links={links}
          />
          <div className="main-content">
            <Route exact path="/account/orders" component={View} />
            <Route path="/account/orders/create" component={Create} />
            <Route path="/account/orders/edit/:id" component={Edit} />
          </div>
          <Footer />
        </main>
      </div>
    );
  }
}

export default withRouter(connect(state => state.orders)(Orders));
