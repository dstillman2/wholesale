import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textarea from '../../form_fields/textarea';
import Textbox from '../../form_fields/textbox';
import Button from '../../widgets/button';
import Loader from '../../widgets/loader';

import {
  ajaxFetchMarketplace,
  ajaxUpdateMarketplace,
  updateMarketplaceData,
  forceUpdateMarketplaceProps,
} from '../../../actions/marketplace.actions';

class MarketplaceEditEmails extends React.Component {
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
      this.sendgrid_api_key.setValue(nextProps.data.sendgrid_api_key || '');
      this.automated_email.setValue(nextProps.data.automated_email || '');
      this.order_confirmation_email.setValue(nextProps.data.order_confirmation_email || '');
      this.contact_form_email.setValue(nextProps.data.contact_form_email || '');
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

    const requiredFields = {
      automated_email: {
        node: this.automated_email,
        errorName: 'Automated email',
      },
      order_confirmation_email: {
        node: this.order_confirmation_email,
        errorName: 'Order confirmation email',
      },
      sendgrid_api_key: {
        node: this.sendgrid_api_key,
      },
      contact_form_email: {
        node: this.contact_form_email,
        errorName: 'Contact form email',
      },
    };

    let errors = {};
    let data = {};

    Object.entries(requiredFields).forEach(([key, field]) => {
      const process = field.process || (val => val);
      const val = field.node.getValue();

      field.node.hideError();

      if (field.func && !field.func(val) && field.errorName) {
        errors = Object.assign(errors, { [key]: true });
      } else if (!val && field.errorName) {
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
                  <span>Emails</span>
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
                                this.props.onClickEdit('email');
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
                      <div className="col-sm-12">
                        <Textbox
                          ref={(c) => { this.sendgrid_api_key = c; }}
                          label="Sendgrid API Key"
                          placeholder="Sendgrid API Key"
                          rows="6"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                        />
                        {
                          !this.state.isStatic && (
                            <p>
                              A Sendgrid API key is only required if you want to send emails from your own domain.
                            </p>
                          )
                        }
                      </div>
                      <div className="col-sm-12">
                        <Textbox
                          ref={(c) => { this.automated_email = c; }}
                          label="Send Emails from:"
                          placeholder="noreply@yourbusiness.com"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          onBlur={(value) => {

                          }}
                          required
                        />
                      </div>
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.contact_form_email = c; }}
                          label="Send Emails to:"
                          placeholder="noreply@yourbusiness.com"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                        {
                          !this.state.isStatic && (
                            <p>
                              Contact form requests will be sent to the above email address.
                            </p>
                          )
                        }
                      </div>
                      <div className="col-sm-12">
                        <Textarea
                          ref={(c) => { this.order_confirmation_email = c; }}
                          label="Order Confirmation Email"
                          placeholder="Order confirmation email message."
                          rows="6"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">No message specified.</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
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

MarketplaceEditEmails.defaultProps = {
  data: {},
  isStatic: true,
};

MarketplaceEditEmails.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.marketplace, { settings: state.settings }))(MarketplaceEditEmails));
