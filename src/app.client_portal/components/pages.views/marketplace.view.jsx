import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import MarketplaceBilling from './marketplace.edit/billing';

class Marketplace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onClickEdit = this.onClickEdit.bind(this);
  }

  onClickEdit(str) {
    switch (str) {
      case 'billing':
        this.setState({
          isBillingPanelOpen: true,
          isLogoPanelOpen: false,
          isCategoryPanelOpen: false,
          isEmailCategoryOpen: false,
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
            <MarketplaceBilling
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isBillingPanelOpen}
              {...this.props}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect()(Marketplace));
