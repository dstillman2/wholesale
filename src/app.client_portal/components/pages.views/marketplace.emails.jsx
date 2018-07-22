import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import MarketplaceEmails from './marketplace.edit/emails';

class Marketplace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onClickEdit = this.onClickEdit.bind(this);
  }

  onClickEdit(str) {
    switch (str) {
      case 'email':
        this.setState({
          isBillingPanelOpen: false,
          isLogoPanelOpen: false,
          isCategoryPanelOpen: false,
          isEmailCategoryOpen: true,
        });

        break;
      default:
    }
  }

  render() {
    return (
      <div className="container nimbus-form">
        <div className="row">
          <div className="col-md-8">
            <MarketplaceEmails
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isEmailCategoryOpen}
              {...this.props}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect()(Marketplace));
