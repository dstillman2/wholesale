import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import { ajaxCreateAccount } from '../../actions/account.actions';
import Button from '../widgets/button';

class Login extends React.Component {
  constructor() {
    super();

    this.state = { panelId: 1 };
    this.fields1 = {};
    this.fields2 = {};

    this.validatePanelOne = this.validatePanelOne.bind(this);
    this.validatePanelTwo = this.validatePanelTwo.bind(this);
  }

  componentDidMount() {
    this.fields1.company.focus();
  }

  hasValidFieldValues(fields) {
    let hasError = false;

    this.setState({ error: false });

    Object.keys(fields).forEach((field) => {
      fields[field].hideError();
    });

    Object.keys(fields).reverse().forEach((field) => {
      const elem = fields[field];
      const val = elem.getValue();

      if (!val && elem.props.required) {
        hasError = true;
        this.setState({ error: 'Please correct the errors in the form below.' });
        elem.showError(
          `${field[0].toUpperCase()}${field.slice(1).replace('_', ' ')} is a required field.`,
        );
        elem.focus();
      }
    });

    return !hasError;
  }

  validatePanelOne() {
    if (!this.hasValidFieldValues(this.fields1)) {
      return;
    }

    if (this.fields1.confirm_password.getValue() !== this.fields1.password.getValue()) {
      this.setState({ error: 'The confirm password and password fields must match.' });

      this.fields1.confirm_password.showError('Passwords do not match.');
      this.fields1.password.showError('Passwords do not match.');
      this.fields1.password.focus();

      return;
    }

    this.setState({ panelId: 2 });
    window.setTimeout(() => {
      this.fields2.address_1.focus();
    });
  }

  validatePanelTwo(e) {
    e.preventDefault();

    if (!this.hasValidFieldValues(this.fields2)) {
      return;
    }

    const data = {};
    const fields = Object.assign({}, this.fields1, this.fields2);

    Object.keys(fields).forEach((field) => {
      data[field] = fields[field].getValue();
    });

    this.setState({ isCreating: true });

    this.props.dispatch(
      ajaxCreateAccount({
        data,
        onSuccess: () => {
          window.location.href = '/login';
        },
        onFailure: (response) => {
          let errorCode;

          try {
            errorCode = response.error.data.code;
          } finally {
            switch (errorCode) {
              case 275:
                this.setState({ error: 'The email address is already in use.' });
                break;
              default:
                this.setState({ error: 'There was an error. Please try again or contact support.' });
                break;
            }
          }

          this.setState({ isCreating: false });
        },
      }),
    );
  }

  render() {
    return (
      <div className="row min-h-fullscreen center-vh p-20 m-0">
        <main className="col-12" id="login">
          <div
            className="card card-shadowed shadow-2 px-50 py-30 w-700px mx-auto"
            style={{ maxWidth: '100%' }}
          >
            <div className="text-center">
              <div className="logo front">ON</div>
            </div>
            {
              this.state.error && (
                <div className="alert alert-danger mb-25" role="alert">
                  {this.state.error}
                </div>
              )
            }
            <h3>Create an account ({this.state.panelId} of 2)</h3>
            <hr />
            <form onSubmit={this.onSubmit} className="nimbus-form">
              <div className="panel-set" ref={(c) => { this.panelSet = c; }}>
                <div
                  className="panel-transform"
                >
                  <div
                    className="panel"
                    style={this.state.panelId === 1 ? {} : { display: 'none' }}
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.fields1.company = c; }}
                          label="Company"
                          placeholder="Company or Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.fields1.first_name = c; }}
                          label="First Name"
                          placeholder="First Name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.fields1.last_name = c; }}
                          label="Last Name"
                          placeholder="Last Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.fields1.email_address = c; }}
                          label="Email Address"
                          placeholder="Email Address"
                          name="title"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.fields1.password = c; }}
                          label="Password"
                          placeholder="Password"
                          inputType="password"
                          name="title"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.fields1.confirm_password = c; }}
                          label="Confirm Password"
                          placeholder="Confirm Password"
                          inputType="password"
                          name="title"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="panel"
                    style={this.state.panelId === 2 ? {} : { display: 'none' }}
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.fields2.address_1 = c; }}
                          label="Address 1"
                          placeholder="Address 1"
                          name="title"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <Textbox
                          ref={(c) => { this.fields2.address_2 = c; }}
                          label="Address 2"
                          placeholder="Address 2"
                          inputType="text"
                          name="title"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-5">
                        <Textbox
                          ref={(c) => { this.fields2.city = c; }}
                          label="City"
                          placeholder="city"
                          inputType="text"
                          name="title"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <Textbox
                          ref={(c) => { this.fields2.state = c; }}
                          label="State"
                          placeholder="State"
                          inputType="text"
                          name="title"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <Textbox
                          ref={(c) => { this.fields2.zip_code = c; }}
                          label="Zip Code"
                          placeholder="Zip code"
                          inputType="text"
                          name="title"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {
                this.state.panelId === 1 && (
                  <Button
                    name="Next Step"
                    type="button"
                    onClick={this.validatePanelOne}
                    isLoading={this.state.isCreating}
                  />
                )
              }
              {
                this.state.panelId === 2 && (
                  <div className="row">
                    <div className="col-md-4">
                      <Button
                        name="Back"
                        type="button"
                        onClick={() => this.setState({ panelId: 1 })}
                        isLoading={this.state.isCreating}
                        loadingName="Loading.."
                        hasSecondaryBtn
                      />
                    </div>
                    <div className="col-md-8">
                      <Button
                        type="button"
                        name="Create Account"
                        loadingName="Creating.."
                        onClick={this.validatePanelTwo}
                        isLoading={this.state.isCreating}
                      />
                    </div>
                  </div>
                )
              }
            </form>
            <nav className="text-center mt-20" style={{ fontSize: '12px' }}>
              <Link to="/login">Back to Login</Link>
            </nav>
          </div>
        </main>
        <footer className="col-12 align-self-end text-center fs-13">
          <p className="mb-0">
            <small>
              Copyright © 2018 <u>Nimbus</u>. All rights reserved.
            </small>
          </p>
        </footer>
      </div>
    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default withRouter(connect()(Login));
