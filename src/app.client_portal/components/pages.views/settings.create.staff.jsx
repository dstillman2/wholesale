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
  ajaxFetchStaff,
  ajaxCreateStaff,
  ajaxUpdateStaff,
  ajaxDeleteStaff,
  updateStaffData,
  forceUpdateStaffProps,
} from '../../actions/staff.actions';

const badge = value => <span className="badge badge-secondary text-uppercase no-radius ls-1">{value}</span>;

class StaffCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: props.isEditing,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.deleteStaff = this.deleteStaff.bind(this);
  }

  componentDidMount() {
    if (this.props.isEditing) {
      this.fetchStaff(this.props.match.params.id);
    } else {
      this.username.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.isEditing) {
      this.first_name.setValue(nextProps.data.first_name || '');
      this.last_name.setValue(nextProps.data.last_name || '');
      this.username.setValue(nextProps.data.username || '');
      this.is_active.setValue(nextProps.data.is_active);

      if (typeof nextProps.data.permissions === 'string') {
        this.permissions = JSON.parse(nextProps.data.permissions);

        this.is_administrator.setValue(this.permissions.isAdministrator);

        this.permissions_read_orders.setValue(this.permissions.read.orders);
        this.permissions_read_products.setValue(this.permissions.read.products);
        this.permissions_read_customers.setValue(this.permissions.read.customers);

        this.permissions_write_orders.setValue(this.permissions.write.orders);
        this.permissions_write_products.setValue(this.permissions.write.products);
        this.permissions_write_customers.setValue(this.permissions.write.customers);
      }
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateStaffData({}));
  }

  onSubmit(e) {
    e.preventDefault();

    let requiredFields = {
      first_name: {
        node: this.first_name,
        errorName: 'First name',
      },
      last_name: {
        node: this.last_name,
        errorName: 'Last name',
      },
    };

    if (!this.props.isEditing) {
      requiredFields = Object.assign({}, requiredFields, {
        username: {
          node: this.username,
          errorName: 'Username',
        },
        password: {
          node: this.password,
          errorName: 'Password',
        },
        confirm_password: {
          node: this.confirm_password,
          errorName: 'Confirm Password',
        },
      });
    }

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

      if (this.props.isEditing) {
        const password = this.password.getValue();

        if (password.length > 0) {
          data = Object.assign({}, data, {
            password,
            confirm_password: this.confirm_password.getValue(),
          });
        }
      }

      if (!this.props.isEditing || (data.password && data.password.length > 0)) {
        if (data.password.length < 6) {
          this.password.showError('Password must be at least 6 characters');

          return;
        }

        if (data.password !== data.confirm_password) {
          this.password.showError('Password must equal the Confirm Password field.');
          this.confirm_password.showError('Password must equal the Confirm Password field.');

          return;
        }
      }

      const permissions = {
        read: {
          products: this.permissions_read_products.getValue(),
          orders: this.permissions_read_orders.getValue(),
          customers: this.permissions_read_customers.getValue(),
        },

        write: {
          products: this.permissions_write_products.getValue(),
          orders: this.permissions_write_orders.getValue(),
          customers: this.permissions_write_customers.getValue(),
        },

        isAdministrator: this.is_administrator.getValue(),
      };

      data = Object.assign(data, {
        is_active: this.is_active.getValue(),
        permissions: JSON.stringify(permissions),
      });

      if (this.props.isEditing) {
        this.updateStaff(data);
      } else {
        this.createStaff(data);
      }
    }
  }

  fetchStaff(pathId) {
    this.setState({ isEditLoading: true, error: null });

    this.props.dispatch(ajaxFetchStaff({
      pathId,
      onComplete: () => {
        this.setState({ isEditLoading: false });
      },
    }));
  }

  createStaff(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxCreateStaff({
      data,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/settings/staff' });
      },

      onFailure: (response) => {
        try {
          if (response.error.data.code === 100055) {
            this.username.showError('This username is taken. Please select another.');
          }
        } finally {
          this.setState({ isLoading: false });
        }
      },
    }));
  }

  updateStaff(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxUpdateStaff({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchStaff(this.props.match.params.id);
        this.setState({ isLoading: false, isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  deleteStaff() {
    this.setState({ isDeleting: true, error: null });

    this.props.dispatch(ajaxDeleteStaff({
      pathId: this.props.match.params.id,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/settings/staff' });
      },
      onFailure: () => {
        this.setState({ error: 'Failed to delete this staff account. Please try again' });
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

    return (
      <div className="container nimbus-form">
        <div className="row mb-20">
          <div className="col-md-12">
            <button
              className="btn btn-secondary mr-10 btn-secondary-v3"
              style={{ textTransform: 'none' }}
              onClick={() => {
                this.props.history.push({
                  pathname: '/account/settings/staff',
                });
              }}
            >
              Back
            </button>
          </div>
        </div>
        {
          this.state.hasError && (
            <div className="alert alert-danger mb-25" role="alert">
              Please correct the errors highlighted in red below.
            </div>
          )
        }
        <form onSubmit={this.onSubmit} className={this.props.isEditing ? 'product-edit' : ''}>
          <div className="row">
            <div className="col-md-7">
              <div className="card">
                <h5 className="card-title">Staff Info</h5>
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
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.username = c; }}
                          label="Username"
                          placeholder="i.e. johndoe"
                          restrict="noSpaces"
                          maxLength={45}
                          isStatic={this.props.isEditing ? true : this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.first_name = c; }}
                          label="First Name"
                          placeholder="First Name"
                          required
                          isStatic={this.state.isStatic}
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.last_name = c; }}
                          label="Last Name"
                          placeholder="Last Name"
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    {
                      !this.state.isStatic && (
                        <div className="row">
                          <div className="col-md-6">
                            <Textbox
                              ref={(c) => { this.password = c; }}
                              label="Password"
                              placeholder="Password"
                              inputType="password"
                              maxLength={45}
                              defaultStaticText="*******"
                              required={!this.props.isEditing}
                              isStatic={this.state.isStatic}
                            />
                          </div>
                          <div className="col-md-6">
                            <Textbox
                              ref={(c) => { this.confirm_password = c; }}
                              label="Confirm Password"
                              placeholder="Confirm Password"
                              inputType="password"
                              maxLength={45}
                              required={!this.props.isEditing}
                              isStatic={this.state.isStatic}
                            />
                          </div>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card">
                <h5 className="card-title">Account</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <Checkbox
                    ref={(c) => { this.is_active = c; }}
                    label="Account is active"
                    defaultChecked={!this.props.isEditing}
                    isStatic={this.state.isStatic}
                  />
                </div>
              </div>
              <div className="card">
                <h5 className="card-title">Permissions</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <p className="text-center">
                    All accounts can access the dashboard, marketplace, and settings.
                  </p>
                  <hr className="m-15" />
                  <Checkbox
                    ref={(c) => { this.is_administrator = c; }}
                    label="Administrator (user can modify staff accounts and edit company settings)"
                    isStatic={this.state.isStatic}
                    processStaticLabel={(val) => {
                      if (val) {
                        return badge('Is Administrator');
                      }

                      return badge('Not an Administrator');
                    }}
                  />
                  <label>Read Access (user can access data)</label>
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-4">
                        <Checkbox
                          ref={(c) => { this.permissions_read_products = c; }}
                          label="Products"
                          defaultChecked={!this.props.isEditing}
                          isStatic={this.state.isStatic}
                          processStaticLabel={val => (val ? badge('Products') : '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <Checkbox
                          ref={(c) => { this.permissions_read_orders = c; }}
                          label="Orders"
                          defaultChecked={!this.props.isEditing}
                          isStatic={this.state.isStatic}
                          processStaticLabel={val => (val ? badge('Orders') : '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <Checkbox
                          ref={(c) => { this.permissions_read_customers = c; }}
                          label="Customers"
                          defaultChecked={!this.props.isEditing}
                          isStatic={this.state.isStatic}
                          processStaticLabel={val => (val ? badge('Customers') : '')}
                        />
                      </div>
                    </div>
                  </div>
                  <label>Write Access (user can create and update entries)</label>
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-4">
                        <Checkbox
                          ref={(c) => { this.permissions_write_products = c; }}
                          label="Products"
                          defaultChecked={!this.props.isEditing}
                          isStatic={this.state.isStatic}
                          processStaticLabel={val => (val ? badge('Products') : '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <Checkbox
                          ref={(c) => { this.permissions_write_orders = c; }}
                          label="Orders"
                          defaultChecked={!this.props.isEditing}
                          isStatic={this.state.isStatic}
                          processStaticLabel={val => (val ? badge('Orders') : '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <Checkbox
                          ref={(c) => { this.permissions_write_customers = c; }}
                          label="Customers"
                          defaultChecked={!this.props.isEditing}
                          isStatic={this.state.isStatic}
                          processStaticLabel={val => (val ? badge('Customers') : '')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <FloatingFooter isForceStatic>
              {
                !this.state.isStatic && (
                  <div className="container">
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
                          this.props.dispatch(forceUpdateStaffProps());
                          this.setState({ isStatic: true, hasError: false });
                        } else {
                          this.props.history.push({ pathname: '/account/settings/staff' });
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
                            name="DELETE"
                            classes="btn btn-danger mr-10"
                            loadingName="DELETING.."
                            isLoading={this.state.isDeleting}
                            onClick={this.deleteStaff}
                          />
                        </div>
                      )
                    }
                  </div>
                )
              }
              {
                this.state.isStatic && (
                  <div className="container">
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
                      onClick={() => this.props.history.push({ pathname: '/account/settings/staff' })}
                    >
                      Back
                    </button>
                  </div>
                )
              }
            </FloatingFooter>
          </div>
        </form>
      </div>
    );
  }
}

StaffCreate.util = {
  reduce: (a, b) => {
    if (a === true) {
      return true;
    } else if (b === true) {
      return true;
    }

    return false;
  },
};

StaffCreate.defaultProps = {
  data: {},
  isEditing: false,
  permissions: {
    read: {},
    write: {},
  },
};

StaffCreate.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.object,
};

export default withRouter(connect(state => Object.assign({}, state.staff, { settings: state.settings }))(StaffCreate));
