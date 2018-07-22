import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../../form_fields/textbox';
import Button from '../../widgets/button';
import Loader from '../../widgets/loader';
import Checkbox from '../../form_fields/checkbox';

import {
  ajaxFetchMarketplace,
  ajaxUpdateMarketplace,
  updateMarketplaceData,
  forceUpdateMarketplaceProps,
} from '../../../actions/marketplace.actions';

const badge = value => <span className="badge badge-secondary text-uppercase no-radius ls-1">{value}</span>;

class MarketplaceEditBilling extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: true,
      isInitialLoad: true,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchMarketplace();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      if (nextProps.data.payments_has_credit_card) {
        this.payments_has_credit_card.setValue('checked');
        this.setState({ hasCreditCard: true });
      } else {
        this.payments_has_credit_card.setValue(null);
        this.setState({ hasCreditCard: false });
      }

      this.payments_stripe_publishable_key.setValue(nextProps.data.payments_stripe_publishable_key || '');
      this.payments_stripe_secret_key.setValue(nextProps.data.payments_stripe_secret_key || '');

      this.payments_credit_card_markup.setValue(String(nextProps.data.payments_credit_card_markup) || '');
      // this.payments_has_bitcoin.setValue(nextProps.data.payments_has_bitcoin || '');
    }

    if (!nextProps.closePanel) {
      this.setState({ isStatic: true });
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateMarketplaceData({}));
  }

  onSubmit(e) {
    e.preventDefault();

    let requiredFields = {
      payments_has_credit_card: {
        node: this.payments_has_credit_card,
      },
    };

    if (this.payments_has_credit_card.getValue()) {
      requiredFields = Object.assign({}, requiredFields, {
        payments_stripe_secret_key: {
          node: this.payments_stripe_secret_key,
          errorName: 'Stripe secret key',
        },
        payments_stripe_publishable_key: {
          node: this.payments_stripe_publishable_key,
          errorName: 'Stripe publishable key',
        },
        payments_credit_card_markup: {
          node: this.payments_credit_card_markup,
          errorName: 'Credit card markup',
        },
        // payments_has_bitcoin: {
        //   node: this.payments_has_bitcoin,
        // },
      });
    }

    let errors = {};
    let data = {};

    Object.entries(requiredFields).forEach(([key, field]) => {
      const process = field.process || (val => val);
      const val = field.node.getValue();

      field.node.hideError();

      if (field.func && !field.func(val) && field.errorName) {
        errors = Object.assign(errors, { [key]: true });
      } else if (typeof val !== 'boolean' && !val && field.errorName) {
        errors = Object.assign(errors, { [key]: true });
      } else {
        data = Object.assign(data, { [key]: process(val) });
      }
    });

    if (Object.keys(errors).length > 0) {
      Object.keys(errors).reverse().forEach((key) => {
        const name = (
          requiredFields[key].errorName || `${key[0].toUpperCase()}${key.slice(1)}`
        );

        requiredFields[key].node.showError(
          `${name} is a required field.`,
        );

        requiredFields[key].node.focus();
      });
    } else {
      this.updateMarketplace(data);
    }
  }

  fetchMarketplace() {
    this.setState({ isFetching: true, error: null });

    this.props.dispatch(ajaxFetchMarketplace({
      onComplete: () => {
        this.setState({ isFetching: false, isInitialLoad: false });
      },
    }));
  }

  updateMarketplace(data) {
    this.setState({ isUpdating: true, error: null });
    this.props.dispatch(ajaxUpdateMarketplace({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchMarketplace();
        this.setState({ isUpdating: false, isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error, isUpdating: false });
      },
    }));
  }

  closePanel() {
    this.setState({ isStatic: true });
  }

  render() {
    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    return (
      <div className="nimbus-form">
        <form onSubmit={this.onSubmit} className="product-edit">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <h5 className="card-title" style={{ float: 'right' }}>
                  <span>Billing</span>
                  {
                    window.orderNimbusSettings.permissions.isAdministrator && (
                      <div style={{ float: 'right' }}>
                        {
                          this.state.isStatic ? (
                            <Button
                              type="button"
                              name="Edit"
                              classes="btn btn-secondary-v2 mr-10"
                              isLoading={this.state.isUpdating || this.state.isFetching}
                              loadingName="Updating..."
                              onClick={() => {
                                this.props.onClickEdit('billing');
                                this.setState({ isStatic: false });
                              }}
                            />
                          ) : (
                            <Button
                              type="button"
                              name="Cancel"
                              classes="btn btn-secondary-v2 mr-10"
                              isLoading={this.state.isUpdating || this.state.isFetching}
                              loadingName="Updating..."
                              onClick={() => {
                                this.setState({ isStatic: true });
                                this.props.dispatch(forceUpdateMarketplaceProps());
                              }}
                            />
                          )
                        }
                      </div>
                    )
                  }
                </h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isInitialLoad && isLoadingNode }
                  <div>
                    <div className="alert alert-danger" role="alert" hidden>
                      Please fill out all required fields.
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        {
                          !this.state.isStatic && (
                            <div className="mb-2 text-right">
                              <span style={{ color: 'red' }}>*</span> is a required field
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6">
                        <Checkbox
                          ref={(c) => { this.payments_has_credit_card = c; }}
                          label="Accept Credit Cards"
                          onChange={bool => this.setState({ hasCreditCard: bool })}
                          isStatic={this.state.isStatic}
                          processStaticLabel={(value) => {
                            if (value) {
                              return badge('Credit Cards Accepted');
                            }

                            return badge('Cash Only');
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="row"
                      style={this.state.hasCreditCard ? {} : { display: 'none' }}
                    >
                      <div className="col-sm-12">
                        <hr style={{ margin: '0 0 15px 0', padding: 0 }} />
                      </div>
                      {
                        !this.state.isStatic && (
                          <div className="col-sm-12">
                            <p>
                              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#333', margin: '15px 0 25px 0' }}>
                                <u>Create a stripe account</u>
                              </a> to accept credit card payments.
                            </p>
                          </div>
                        )
                      }
                      <div className="col-sm-6">
                        <Textbox
                          ref={(c) => { this.payments_stripe_secret_key = c; }}
                          label="Stripe Secret Key"
                          placeholder="Stripe API Key"
                          defaultStaticText="*******"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-sm-6">
                        <Textbox
                          ref={(c) => { this.payments_stripe_publishable_key = c; }}
                          label="Stripe Publishable Key"
                          placeholder="Stripe Publishable Key"
                          defaultStaticText="*******"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-sm-6">
                        <Textbox
                          ref={(c) => { this.payments_credit_card_markup = c; }}
                          label="Order Credit Card Markup (%)"
                          placeholder="Payment Markup"
                          restrict="floatOnly"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <hr />
                      {
                        // <div className="col-sm-12">
                        //   <Checkbox
                        //     ref={(c) => { this.payments_has_bitcoin = c; }}
                        //     label="Accept Bitcoin"
                        //     isStatic={this.state.isStatic}
                        //     processStaticLabel={(value) => {
                        //       if (value) {
                        //         return badge('Accepting Bitcoin');
                        //       }
                        //
                        //       return badge('Not Accepting Bitcoin');
                        //     }}
                        //   />
                        // </div>
                      }
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        {
                          !this.state.isStatic && (
                            <hr style={{ margin: '15px 0' }} />
                          )
                        }
                        {
                          !this.state.isStatic && (
                            <div className="float-right">
                              {
                                !this.state.isUpdating && (
                                  <Button
                                    type="submit"
                                    name="Cancel"
                                    classes="btn btn-secondary square-border mr-10"
                                    loadingName="Cancel"
                                    isLoading={this.state.isUpdating}
                                    onClick={() => {
                                      this.setState({ isStatic: true });
                                      this.props.dispatch(forceUpdateMarketplaceProps());
                                    }}
                                  />
                                )
                              }
                              <Button
                                type="submit"
                                name="Update"
                                classes="btn btn-primary square-border"
                                isLoading={this.state.isUpdating}
                                loadingName="Updating..."
                                onClick={this.onSubmit}
                              />
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

MarketplaceEditBilling.defaultProps = {
  data: {},
  isStatic: true,
};

MarketplaceEditBilling.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.marketplace, { settings: state.settings }))(MarketplaceEditBilling));
