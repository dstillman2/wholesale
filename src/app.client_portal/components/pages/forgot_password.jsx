import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import sendAjaxRequest from '../../actions/ajax.actions';
import Button from '../widgets/button';

class Login extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.emailAddress.focus();
  }

  onSubmit(e) {
    e.preventDefault();

    const emailAddress = this.emailAddress.getValue();

    // Field validation
    if (!emailAddress) {
      this.emailAddress.showError('Email address is a required field');
      this.emailAddress.focus();

      return;
    }

    this.emailAddress.hideError();

    this.setState({ isLoading: true });

    // Send ajax request
    this.props.dispatch(sendAjaxRequest({
      select: 'postForgotPassword',

      data: {
        email_address: emailAddress,
      },

      onSuccess: () => {
        this.setState({ hasError: false, showSuccessMessage: true });
        this.emailAddress.clearField();
      },

      onFailure: () => {
        this.emailAddress.focus();
        this.emailAddress.clearField();

        this.setState({ hasError: true });
      },

      onComplete: () => {
        this.setState({ isLoading: false });
      },
    }));
  }

  render() {
    return (
      <div className="row min-h-fullscreen center-vh p-20 m-0">
        <main className="col-12" id="login">
          <div
            className="card card-shadowed shadow-2 px-50 py-30 w-500px mx-auto"
            style={{ maxWidth: '100%', boxShadow: '0 0 30px 3px #000' }}
          >
            <div className="text-center">
              <div className="logo front">ON</div>
            </div>
            {
              this.state.hasError && (
                <div className="alert alert-danger mb-25" role="alert">
                  There was an error with this request. Please try again.
                </div>
              )
            }
            {
              this.state.showSuccessMessage && (
                <div className="alert alert-info mb-25" role="alert">
                  Please check your email to reset your password.
                </div>
              )
            }
            <h3>Recover Password</h3>
            <hr />
            <form onSubmit={this.onSubmit} className="nimbus-form">
              <div className="form-group">
                <Textbox
                  ref={(c) => { this.emailAddress = c; }}
                  label="Email Address"
                  placeholder="Email Address"
                  name="title"
                  required
                />
              </div>

              <div className="form-group">
                <Button
                  type="submit"
                  name="Send Password Reset Email"
                  loadingName="Please Wait.."
                  isLoading={this.state.isLoading}
                  hasColor
                />
              </div>
            </form>
            <nav className="text-center" style={{ fontSize: '12px' }}>
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

export default connect()(Login);
