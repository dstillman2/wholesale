import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import MarketplaceCategory from './marketplace.edit/category';
import MarketplaceLogo from './marketplace.edit/logo';

class Marketplace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onClickEdit = this.onClickEdit.bind(this);
  }

  onClickEdit(str) {
    switch (str) {
      case 'logo':
        this.setState({
          isBillingPanelOpen: false,
          isLogoPanelOpen: true,
          isCategoryPanelOpen: false,
          isEmailCategoryOpen: false,
        });

        break;
      case 'category':
        this.setState({
          isBillingPanelOpen: false,
          isLogoPanelOpen: false,
          isCategoryPanelOpen: true,
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
            <MarketplaceCategory
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isCategoryPanelOpen}
            />
            <MarketplaceLogo
              onClickEdit={this.onClickEdit}
              closePanel={this.state.isLogoPanelOpen}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect()(Marketplace));
