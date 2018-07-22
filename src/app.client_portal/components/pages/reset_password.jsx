import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import sendAjaxRequest from '../../actions/ajax.actions';
import Button from '../widgets/button';

class ResetPassword extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.password.focus();
  }

  onSubmit(e) {
    e.preventDefault();

    const password = this.password.getValue();

    // Field validation
    if (!password) {
      this.password.showError('Password is a required field');
      this.password.focus();

      return;
    }

    this.password.hideError();

    this.setState({ isLoading: true });

    // Send ajax request
    this.props.dispatch(sendAjaxRequest({
      select: 'postResetPassword',

      data: {
        password,
        token: window.location.href.split('?')[1].split('=')[1],
      },

      onSuccess: () => {
        window.location.href = '/login';
      },

      onFailure: () => {
        this.password.focus();
        this.password.clearField();

        this.setState({ hasError: true, hasSuccessMessage: false });
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
                  There was an error with the reset password request. Please try again.
                </div>
              )
            }
            <h3>Reset Password</h3>
            <hr />
            <form onSubmit={this.onSubmit} className="nimbus-form">
              <div className="form-group">
                <Textbox
                  ref={(c) => { this.password = c; }}
                  label="New Password"
                  inputType="password"
                  placeholder="Password"
                  name="title"
                  required
                />
              </div>

              <div className="form-group">
                <Button
                  type="submit"
                  name="Update Password"
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

ResetPassword.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(ResetPassword);
