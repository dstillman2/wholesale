import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Header from '../pages.components/header';
import SecondaryHeader from '../pages.components/secondary_header';
import Footer from '../pages.components/footer';
import View from '../pages.views/dashboard.view';

class Dashboard extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <div id="dashboard">
        <Header />
        <main className="main-container">
          <SecondaryHeader />
          <div className="main-content">
            <View />
          </div>
          <Footer />
        </main>
      </div>
    );
  }
}

export default withRouter(connect(state => state)(Dashboard));
