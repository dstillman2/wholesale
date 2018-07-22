import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class Events extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <div>Events</div>
    );
  }
}

export default withRouter(connect(state => state)(Events));
