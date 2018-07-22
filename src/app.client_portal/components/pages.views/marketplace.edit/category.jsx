import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../../form_fields/textbox';
import Button from '../../widgets/button';
import Loader from '../../widgets/loader';

import {
  ajaxFetchAccount,
  ajaxUpdateAccount,
  updateAccountData,
  forceUpdateAccountProps,
} from '../../../actions/account.actions';

class MarketplaceEditMarketplace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: true,
      isInitialLoad: true,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchAccount();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      this.subdomain.setValue(nextProps.data.subdomain || '');
      this.domain.setValue(nextProps.data.domain || '');
    }

    if (!nextProps.closePanel) {
      this.setState({ isStatic: true });
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateAccountData({}));
  }

  onSubmit(e) {
    e.preventDefault();

    const requiredFields = {
      subdomain: {
        node: this.subdomain,
        errorName: 'Subdomain',
      },
      domain: {
        node: this.domain,
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
      this.updateAccount(data);
    }
  }

  fetchAccount() {
    this.setState({ isFetching: true, error: null });

    this.props.dispatch(ajaxFetchAccount({
      onComplete: () => {
        this.setState({ isFetching: false, isInitialLoad: false });
      },
    }));
  }

  updateAccount(data) {
    this.setState({ isUpdating: true, error: null });

    this.props.dispatch(ajaxUpdateAccount({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchAccount();
        this.setState({ isUpdating: false, isStatic: true });
      },
      onFailure: (response) => {
        if (response.data && response.data.errorId === 6) {
          this.setState({ error: 'The subdomain name is already taken. Please select another.' });
          this.subdomain.showError('Select a different subdomain name.');
          this.subdomain.focus();
        } else if (response.data && response.data.errorId === 5) {
          this.setState({ error: 'The domain name is in use. Please select another.' });
          this.domain.showError('Select a different domain name.');
          this.domain.focus();
        } else {
          this.setState({ error: 'An error has occurred. Please try again.' });
        }
      },
      onComplete: () => {
        this.setState({ isUpdating: false });
      },
    }));
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
                { this.state.isInitialLoad && isLoadingNode }
                <h5 className="card-title" style={{ float: 'right' }}>
                  <span>Domain Name</span>
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
                                this.props.onClickEdit('category');
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
                                this.props.dispatch(forceUpdateAccountProps());
                              }}
                            />
                          )
                        }
                      </div>
                    )
                  }
                </h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isEditLoading && isLoadingNode }
                  <div>
                    {
                      this.state.error && (
                        <div className="alert alert-danger mb-25" role="alert">
                          {this.state.error}
                        </div>
                      )
                    }
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
                      <div className="col-md-8">
                        <div className="row">
                          <div className="col-md-6">
                            <Textbox
                              ref={(c) => { this.subdomain = c; }}
                              label="Subdomain"
                              placeholder="[subdomain].ordernimbus.com"
                              defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                              isStatic={this.state.isStatic}
                              processStaticValue={value => `${value}.ordernimbus.com`}
                              required
                            />
                          </div>
                          {
                            !this.state.isStatic && (
                              <div className="col-md-6">
                                <p style={{ fontSize: 14, paddingTop: 42 }}>.ordernimbus.com</p>
                              </div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-8">
                        <Textbox
                          ref={(c) => { this.domain = c; }}
                          label="Domain"
                          placeholder="domain name"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
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
                                      this.setState({ isStatic: true, error: null });
                                      this.props.dispatch(forceUpdateAccountProps());
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

MarketplaceEditMarketplace.defaultProps = {
  data: {},
  isStatic: true,
};

MarketplaceEditMarketplace.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.account, { settings: state.settings }))(MarketplaceEditMarketplace));
