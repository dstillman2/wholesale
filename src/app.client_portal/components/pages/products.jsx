import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import Header from '../pages.components/header';
import SecondaryHeader from '../pages.components/secondary_header';
import Footer from '../pages.components/footer';
import Create from '../pages.views/products.create';
import View from '../pages.views/products.view';
import Edit from '../pages.views/products.edit';
import Category from '../pages.views/products.category';

class Products extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    let name = 'Loading..';

    if (this.props.data) {
      name = `${this.props.data.name}`;
    }

    const links = [
      {
        title: 'Categories',
        href: '/account/products/categories',
        hasBorderRight: true,
        permissions: window.orderNimbusSettings.permissions.write.products,
      },
      {
        title: 'All Products',
        href: '/account/products',
        isExactMatch: true,
        permissions: window.orderNimbusSettings.permissions.read.products,
      },
      {
        title: 'Add Product',
        href: '/account/products/create',
        isExactMatch: true,
        permissions: window.orderNimbusSettings.permissions.write.products,
      },
      {
        title: `${name}`,
        href: '/account/products/edit',
        isShownOnlyIfMatched: true,
        hasNoLink: true,
        permissions: window.orderNimbusSettings.permissions.read.products,
      },
    ];

    return (
      <div id="products">
        <Header />
        <main className="main-container">
          <SecondaryHeader
            links={links}
          />
          <div className="main-content">
            <Route exact path="/account/products" component={View} />
            <Route exact path="/account/products/create" component={Create} />
            <Route exact path="/account/products/edit/:id" component={Edit} />
            <Route exact path="/account/products/categories" component={Category} />
          </div>
          <Footer />
        </main>
      </div>
    );
  }
}

export default withRouter(connect(state => state.products)(Products));
