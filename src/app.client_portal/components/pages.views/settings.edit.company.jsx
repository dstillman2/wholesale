import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import Button from '../widgets/button';
import Loader from '../widgets/loader';

import {
  ajaxFetchAccount,
  ajaxUpdateAccount,
  updateAccountData,
  forceUpdateAccountProps,
} from '../../actions/account.actions';

class SettingsEditCompany extends React.Component {
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
      this.company.setValue(nextProps.data.company || '');
      this.address_1.setValue(nextProps.data.address1 || '');
      this.address_2.setValue(nextProps.data.address2 || '');
      this.city.setValue(nextProps.data.city || '');
      this.getState.setValue(nextProps.data.state || '');
      this.zip_code.setValue(nextProps.data.zip_code || '');
      this.email_address.setValue(nextProps.data.email_address || '');
      this.phone_number.setValue(nextProps.data.phone_number || '');
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
      company: {
        node: this.company,
        errorName: 'Company',
      },
      address_1: {
        node: this.address_1,
        errorName: 'Address 1',
      },
      address_2: {
        node: this.address_2,
      },
      city: {
        node: this.city,
        errorName: 'City',
      },
      state: {
        node: this.getState,
        errorName: 'State',
      },
      zip_code: {
        node: this.zip_code,
        errorName: 'Zip code',
      },
      phone_number: {
        node: this.phone_number,
        errorName: 'Phone number',
      },
      email_address: {
        node: this.email_address,
        errorName: 'Email address',
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
        this.setState({ hasError: true });
      });
    } else {
      this.setState({ hasError: false });
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
                  <span>Company</span>
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
                                this.props.onClickEdit('company');
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
                                this.setState({ isStatic: true, hasError: false });
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
                    {
                      this.state.hasError && (
                        <div className="alert alert-danger mb-25" role="alert">
                          Please correct the errors highlighted in red below.
                        </div>
                      )
                    }
                    <div className="row">
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.company = c; }}
                          label="Company"
                          placeholder="Company or Your Name"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-12">
                        <Textbox
                          ref={(c) => { this.address_1 = c; }}
                          label="Address 1"
                          placeholder="Address 1"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-sm-12">
                        <Textbox
                          ref={(c) => { this.address_2 = c; }}
                          label="Address 2"
                          placeholder="Address 2"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-4">
                        <Textbox
                          ref={(c) => { this.city = c; }}
                          label="City"
                          placeholder="City"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-sm-4">
                        <Textbox
                          ref={(c) => { this.getState = c; }}
                          label="State"
                          placeholder="State"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-sm-4">
                        <Textbox
                          ref={(c) => { this.zip_code = c; }}
                          label="Zip Code"
                          placeholder="Zip Code"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6">
                        <Textbox
                          ref={(c) => { this.phone_number = c; }}
                          label="Business Phone Number"
                          placeholder="Phone Number"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-sm-6">
                        <Textbox
                          ref={(c) => { this.email_address = c; }}
                          label="Business Email Address"
                          placeholder="Email Address"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
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
                                      this.setState({ isStatic: true, hasError: false });
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

SettingsEditCompany.defaultProps = {
  data: {},
  isStatic: true,
};

SettingsEditCompany.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.account, { settings: state.settings }))(SettingsEditCompany));
