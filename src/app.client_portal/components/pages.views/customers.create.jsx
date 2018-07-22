import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import Checkbox from '../form_fields/checkbox';
import Button from '../widgets/button';
import Loader from '../widgets/loader';
import FloatingFooter from '../widgets/floating_footer';
import {
  ajaxFetchCustomer,
  ajaxCreateCustomer,
  ajaxUpdateCustomer,
  ajaxDeleteCustomer,
  updateCustomerData,
  forceUpdateCustomerProps,
} from '../../actions/customer.actions';

const badge = value => <span className="badge badge-secondary text-uppercase no-radius ls-1">{value}</span>;

class CustomerCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: props.isEditing,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.deleteCustomer = this.deleteCustomer.bind(this);
  }

  componentDidMount() {
    if (this.props.isEditing) {
      this.fetchCustomer(this.props.match.params.id);
    } else {
      this.company.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.isEditing) {
      this.company.setValue(nextProps.data.company || '');
      this.first_name.setValue(nextProps.data.firstName || '');
      this.last_name.setValue(nextProps.data.lastName || '');
      this.address_1.setValue(nextProps.data.address1 || '');
      this.address_2.setValue(nextProps.data.address2 || '');
      this.city.setValue(nextProps.data.city || '');
      this.whichstate.setValue(nextProps.data.state || '');
      this.zip_code.setValue(nextProps.data.zip_code || '');
      this.EIN.setValue(nextProps.data.EIN || '');
      this.email_address.setValue(nextProps.data.email_address || '');
      this.is_active.setValue(nextProps.data.is_active || false);
      this.phone_number.setValue(nextProps.data.phone_number || '');
      // this.discount.setValue((nextProps.data.discount / 100).toFixed(2) || '');
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateCustomerData({}));
  }

  onSubmit(e) {
    e.preventDefault();

    const requiredFields = {
      company: {
        node: this.company,
        errorName: 'Company',
      },
      first_name: {
        node: this.first_name,
        errorName: 'First Name',
      },
      last_name: {
        node: this.last_name,
        errorName: 'Last Name',
      },
      address_1: {
        node: this.address_1,
        errorName: 'Address 1',
      },
      city: {
        node: this.city,
        errorName: 'City',
      },
      state: {
        node: this.whichstate,
        errorName: 'State',
      },
      zip_code: {
        node: this.zip_code,
        errorName: 'Zip Code',
      },
      email_address: {
        node: this.email_address,
        errorName: 'Email Address',
      },
    };

    let errors = {};
    let data = {};

    Object.entries(requiredFields).forEach(([key, field]) => {
      const process = field.process || (val => val);
      const val = field.node.getValue();

      field.node.hideError();

      if (field.func && !field.func(val)) {
        errors = Object.assign(errors, { [key]: true });
      } else if (!val) {
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

      data = Object.assign(data, {
        EIN: this.EIN.getValue().replace('-', ''),
        phone_number: this.phone_number.getValue().replace(/\D+/g, ''),
        is_active: this.is_active.getValue(),
        address_2: this.address_2.getValue(),
        // discount,
      });

      if (this.props.isEditing) {
        this.updateCustomer(data);
      } else {
        this.createCustomer(data);
      }
    }
  }

  fetchCustomer(pathId) {
    this.setState({ isEditLoading: true, error: null });

    this.props.dispatch(ajaxFetchCustomer({
      pathId,
      onComplete: () => {
        this.setState({ isEditLoading: false });
      },
    }));
  }

  createCustomer(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxCreateCustomer({
      data,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/customers' });
      },

      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  updateCustomer(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxUpdateCustomer({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchCustomer(this.props.match.params.id);
        this.setState({ isLoading: false, isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  deleteCustomer() {
    this.setState({ isDeleting: true, error: null });

    this.props.dispatch(ajaxDeleteCustomer({
      pathId: this.props.match.params.id,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/customers' });
      },
      onFailure: () => {
        this.setState({ error: 'Failed to delete this customer. Please try again' });
        this.setState({ isDeleting: false });
      },
    }));
  }

  render() {
    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    const isLoadingNodeEmpty = <div className="loader blank-screen" />;

    let navBar = (
      <FloatingFooter>
        {
          !this.state.isStatic && (
            <div>
              <Button
                type="submit"
                name={this.props.isEditing ? 'Update' : 'Create'}
                classes="btn btn-primary mr-10"
                isLoading={this.state.isLoading}
                loadingName={this.props.isEditing ? 'Updating..' : 'Creating..'}
                onClick={this.onSubmit}
              />
              <button
                type="button"
                className="btn btn-secondary mr-10"
                onClick={() => {
                  if (this.props.isEditing) {
                    this.setState({ isStatic: true, hasError: false });
                    this.props.dispatch(forceUpdateCustomerProps());
                  } else {
                    this.props.history.push({ pathname: '/account/customers' });
                  }
                }}
              >
                Cancel
              </button>
              {
                this.props.isEditing && (
                  <div style={{ float: 'right' }}>
                    <Button
                      type="button"
                      name="Delete"
                      classes="btn btn-danger mr-10"
                      loadingName="DELETING.."
                      isLoading={this.state.isDeleting}
                      onClick={this.deleteCustomer}
                    />
                  </div>
                )
              }
            </div>
          )
        }
        {
          this.state.isStatic && (
            <div>
              <Button
                type="submit"
                name="Edit"
                classes="btn btn-primary mr-10"
                isLoading={this.state.isLoading}
                loadingName="Edit"
                onClick={() => this.setState({ isStatic: false })}
              />
              <button
                type="button"
                className="btn btn-secondary mr-10"
                onClick={() => this.props.history.push({ pathname: '/account/customers' })}
              >
                Back
              </button>
            </div>
          )
        }
      </FloatingFooter>
    );

    if (!window.orderNimbusSettings.permissions.write.customers) {
      navBar = <div />;
    }

    return (
      <div className="container nimbus-form">
        <form onSubmit={this.onSubmit} className={this.props.isEditing ? 'customer-edit' : ''}>
          <div className="row">
            <div className="col-md-12">
              {navBar}
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
            <div className="col-md-7">
              <div className="card ">
                <h5 className="card-title">Customer Info</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isEditLoading && isLoadingNode }
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
                        <Textbox
                          ref={(c) => { this.company = c; }}
                          label="Company"
                          placeholder="Company"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.first_name = c; }}
                          label="First Name"
                          placeholder="i.e. John"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.last_name = c; }}
                          label="Last Name"
                          placeholder="i.e. Doe"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card ">
                <h5 className="card-title">Customer Delivery Address</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isEditLoading && isLoadingNodeEmpty }
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
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.address_1 = c; }}
                          label="Address 1"
                          placeholder="i.e. 123 Lindero Drive"
                          maxLength={120}
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.address_2 = c; }}
                          label="Address 2 (Room #, Suite)"
                          maxLength={120}
                          placeholder="i.e. Rm 4"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <Textbox
                          ref={(c) => { this.city = c; }}
                          label="City"
                          maxLength={90}
                          placeholder="i.e. Los Angeles"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <Textbox
                          ref={(c) => { this.whichstate = c; }}
                          label="State"
                          placeholder="i.e. CA"
                          maxLength={10}
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <Textbox
                          ref={(c) => { this.zip_code = c; }}
                          label="Zip Code"
                          placeholder="i.e. 90025"
                          maxLength={15}
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card ">
                <h5 className="card-title">Contact Info</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <div>
                    <div className="alert alert-danger" role="alert" hidden>
                      Please fill out all required fields.
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.email_address = c; }}
                          label="Email Address"
                          placeholder="i.e. johndoe@example.com"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.phone_number = c; }}
                          label="Phone Number"
                          placeholder="i.e. (623) 500-5000"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card ">
                <h5 className="card-title">Tax Information</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <Textbox
                    ref={(c) => { this.EIN = c; }}
                    label="EIN"
                    placeholder="i.e. 12-3456789"
                    maxLength={10}
                    restrict="einOnly"
                    defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                    isStatic={this.state.isStatic}
                  />
                </div>
              </div>
              <div className="card ">
                <h5 className="card-title">Account</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <Checkbox
                    ref={(c) => { this.is_active = c; }}
                    label="Account is active"
                    defaultChecked={!this.props.isEditing}
                    isStatic={this.state.isStatic}
                    processStaticLabel={(value) => {
                      if (value) {
                        return badge('Account is active');
                      }

                      return badge('Account is inactive');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {navBar}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

CustomerCreate.defaultProps = {
  data: {},
  isEditing: false,
};

CustomerCreate.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.object,
};

export default withRouter(connect(state => Object.assign({}, state.customers, { settings: state.settings }))(CustomerCreate));
