import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import Select from '../form_fields/select';
import Button from '../widgets/button';
import Loader from '../widgets/loader';
import createInvoice from '../../schemas/invoices/invoice.default';
import TextboxAjaxSearch from '../form_fields/textbox_ajax_search';
import NavBar from '../widgets/floating_footer';
import ProductTable from '../widgets/product_table';
import {
  ajaxFetchAccount,
} from '../../actions/account.actions';
import {
  ajaxFetchOrder,
  ajaxCreateOrder,
  ajaxUpdateOrder,
  ajaxDeleteOrder,
  forceUpdateOrderProps,
  updateOrderData,
} from '../../actions/order.actions';
import {
  ajaxFetchCustomer,
  ajaxFetchCustomers,
} from '../../actions/customer.actions';

const orderStatusOptions = [
  {
    label: 'Unpaid',
    value: 'unpaid',
  },
  {
    label: 'Paid',
    value: 'paid',
  },
];

const paymentTypeOptions = [
  {
    label: 'Cash',
    value: 'cash',
  },
  {
    label: 'Credit Card',
    value: 'credit_card',
  },
];

class OrderCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: props.isEditing,
      customerOptions: [],
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
    this.downloadInvoice = this.downloadInvoice.bind(this);
    this.setFieldValues = this.setFieldValues.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (this.props.isEditing) {
      this.fetchOrder(this.props.match.params.id);
      this.props.dispatch(ajaxFetchAccount());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.orders && nextProps.orders.data) {
      this.setFieldValues(nextProps.orders.data);
      this.product_table.setValue(nextProps.orders.data.items.data);

      if (nextProps.orders.data.payment_type === 'bitcoin') {
        this.payment_type.setValue('credit_card');
      } else {
        this.payment_type.setValue(nextProps.orders.data.payment_type);
      }

      if (nextProps.orders.data.customer_id) {
        this.customer_id.setValue(nextProps.orders.data.customer_id);
      }
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateOrderData({}));
  }


  onSubmit(e) {
    e.preventDefault();

    const requiredFields = {
      items: {
        node: this.product_table,
        errorName: '',
      },
      company: {
        node: this.company,
        errorName: 'Company',
      },
      shipping_address_1: {
        node: this.shipping_address_1,
        errorName: 'Address 1',
      },
      shipping_address_2: {
        node: this.shipping_address_2,
        errorName: 'Address 2',
        allowEmpty: true,
      },
      shipping_city: {
        node: this.shipping_city,
        errorName: 'City',
      },
      shipping_state: {
        node: this.shipping_state,
        errorName: 'State',
      },
      shipping_zip_code: {
        node: this.shipping_zip_code,
        errorName: 'Zip code',
      },
      payment_type: {
        node: this.payment_type,
        errorName: 'Payment type',
      },
      order_status: {
        node: this.order_status,
        errorName: 'Order status',
      },
    };

    let errors = {};
    let data = {};

    Object.entries(requiredFields).forEach(([key, field]) => {
      const process = field.process || (val => val);
      const val = field.node.getValue();

      field.node.hideError();

      if (field.func && !field.func(val) && !field.allowEmpty) {
        errors = Object.assign(errors, { [key]: true });
      } else if (!val && !field.allowEmpty) {
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

      const nonRequiredFields = {
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        phone_number: this.phone_number,
      };

      Object.keys(nonRequiredFields).forEach((field) => {
        data = Object.assign({}, data, { [field]: nonRequiredFields[field].getValue() || null });
      });

      const customerId = this.customer_id.getValue().id;

      if (customerId) {
        data = Object.assign({}, data, {
          customer_id: customerId,
        });
      }

      if (this.props.isEditing) {
        this.updateOrder(data);
      } else {
        this.createOrder(data);
      }
    }
  }

  fetchOrder(pathId) {
    this.setState({ isOrderLoading: true, error: null });

    this.props.dispatch(ajaxFetchOrder({
      pathId,
      onComplete: () => {
        this.setState({ isOrderLoading: false });
      },
    }));
  }

  createOrder(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxCreateOrder({
      data,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/orders' });
      },

      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  updateOrder(data) {
    this.setState({ isLoading: true, isUpdating: true, error: null });

    this.props.dispatch(ajaxUpdateOrder({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchOrder(this.props.match.params.id);
        this.setState({ isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error });
      },
      onComplete: () => {
        this.setState({ isLoading: false, isUpdating: false });
      },
    }));
  }

  deleteOrder() {
    this.setState({ isDeleting: true, error: null });

    this.props.dispatch(ajaxDeleteOrder({
      pathId: this.props.match.params.id,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/orders' });
      },
      onFailure: () => {
        this.setState({ error: 'Failed to delete this customer. Please try again' });
        this.setState({ isDeleting: false });
      },
    }));
  }

  setFieldValues(order) {
    this.company.setValue(order.company || '');
    this.first_name.setValue(order.firstName || '');
    this.last_name.setValue(order.lastName || '');
    this.shipping_address_1.setValue(order.address1 || order.shippingAddress1 || '');
    this.shipping_address_2.setValue(order.address2 || order.shippingAddress2 || '');
    this.shipping_city.setValue(order.city || order.shippingCity || '');
    this.shipping_state.setValue(order.state || order.shippingState || '');
    this.shipping_zip_code.setValue(order.zip_code || order.shippingZipCode || '');
    this.email_address.setValue(order.email_address || '');
    this.phone_number.setValue(order.phone_number || '');

    if (order.order_status) {
      this.order_status.setValue(order.order_status);
    }
  }

  downloadInvoice(e) {
    e.preventDefault();

    const invoice = createInvoice({
      order: this.props.orders.data,
      account: this.props.account.data,
      products: this.product_table.getValue(),
    });

    invoice.download();
  }

  render() {
    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    const isLoadingNodeEmpty = <div className="loader blank-screen" />;

    let editBar = (
      <NavBar>
        {
          !this.state.isStatic && (
            <div className="col-md-12">
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
                    this.props.dispatch(forceUpdateOrderProps());
                  } else {
                    this.props.history.push({ pathname: '/account/orders' });
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
                      classes="btn btn-danger"
                      loadingName="DELETING.."
                      isLoading={this.state.isDeleting}
                      onClick={this.deleteOrder}
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
                onClick={() => this.props.history.push({ pathname: '/account/orders' })}
              >
                Back
              </button>
            </div>
          )
        }
      </NavBar>
    );

    if (!window.orderNimbusSettings.permissions.write.orders) {
      editBar = <div />;
    }

    return (
      <div className="container nimbus-form">
        <form onSubmit={this.onSubmit} className={this.props.isEditing ? 'customer-edit' : ''}>
          <div className="row">
            {editBar}
          </div>
          {
            this.state.hasError && (
              <div className="alert alert-danger mb-25" role="alert">
                Please correct the errors highlighted in red below.
              </div>
            )
          }
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <h5 className="card-title">Order Items</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  {this.state.isOrderLoading && isLoadingNode}
                  <ProductTable
                    ref={(c) => { this.product_table = c; }}
                    isStatic={this.state.isStatic}
                    {...this.props}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-5">
              {
                this.props.isEditing && this.state.isStatic && (
                  <div className="card relative">
                    <h5 className="card-title">Invoice</h5>
                    <div className="card-body relative" style={{ padding: 30 }}>
                      {this.state.isOrderLoading && isLoadingNodeEmpty}
                      <div className="row">
                        <div className="col-md-12">
                          Click below to download this invoice.
                          <hr className="m-3" />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ textTransform: 'none' }}
                            onClick={() => {
                              window.location.href = `/api/invoices/${this.props.match.params.id}`;
                            }}
                          >
                            Download
                            <i className="ti-download fs-12 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              <div className="card">
                <h5 className="card-title">Link Order to Customer (optional)</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  {this.state.isOrderLoading && isLoadingNodeEmpty}
                  <div className="row">
                    <div className="col-md-12">
                      <TextboxAjaxSearch
                        ref={(c) => { this.customer_id = c; }}
                        placeholder="Search Existing or Custom.."
                        fetch={ajaxFetchCustomers}
                        editFetch={ajaxFetchCustomer}
                        dispatch={this.props.dispatch}
                        isStatic={this.state.isStatic}
                        onSelection={this.setFieldValues}
                        formatItemDisplay={(item) => {
                          if (item) {
                            return `${item.first_name} ${item.last_name}`;
                          }

                          return '';
                        }}
                        defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                        noLinkBadge
                        showBadge
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h5 className="card-title">Contact Info</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  {this.state.isOrderLoading && isLoadingNodeEmpty}
                  <div>
                    <div className="alert alert-danger" role="alert" hidden>
                      Please fill out all required fields.
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.first_name = c; }}
                          label="First Name"
                          placeholder="i.e. John"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.last_name = c; }}
                          label="Last Name"
                          placeholder="i.e. Doe"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.email_address = c; }}
                          label="Email Address"
                          placeholder="i.e. johndoe@example.com"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
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
            <div className="col-md-7">
              <div className="card">
                <h5 className="card-title">Billing</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  {this.state.isOrderLoading && isLoadingNodeEmpty}
                  <div className="row">
                    <div className="col-md-6">
                      <Select
                        ref={(c) => { this.payment_type = c; }}
                        label="Payment Type"
                        options={paymentTypeOptions}
                        processStaticText={(value) => {
                          let output = '';

                          paymentTypeOptions.forEach((status) => {
                            if (status.value === value) {
                              output = status.label;
                            }
                          });

                          return output;
                        }}
                        isStatic={this.state.isStatic}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Select
                        ref={(c) => { this.order_status = c; }}
                        label="Order Status"
                        options={orderStatusOptions}
                        isStatic={this.state.isStatic}
                        defaultValue={!this.state.isEditing ? 'unpaid' : null}
                        processStaticText={(value) => {
                          let output = '';

                          orderStatusOptions.forEach((status) => {
                            if (status.value === value) {
                              output = status.label;
                            }
                          });

                          return output;
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h5 className="card-title">Order Shipping Address</h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  {this.state.isOrderLoading && isLoadingNodeEmpty}
                  <div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.company = c; }}
                          label="Company"
                          placeholder="Company"
                          defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">N/A</span>}
                          isStatic={this.state.isStatic}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.shipping_address_1 = c; }}
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
                          ref={(c) => { this.shipping_address_2 = c; }}
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
                          ref={(c) => { this.shipping_city = c; }}
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
                          ref={(c) => { this.shipping_state = c; }}
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
                          ref={(c) => { this.shipping_zip_code = c; }}
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
            </div>
          </div>
          <div className="row">
            {editBar}
          </div>
        </form>
      </div>
    );
  }
}

OrderCreate.defaultProps = {
  data: {},
  isEditing: false,
};

OrderCreate.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.object,
};

export default withRouter(connect(state => (
  {
    orders: state.orders || {},
    account: state.account || {},
    settings: state.settings || {},
  }
))(OrderCreate));
