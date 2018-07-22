import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import { ajaxPostLogin } from '../../actions/login.actions';
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

    if (this.state.isLoading) {
      return;
    }

    const username = this.emailAddress.getValue();
    const password = this.password.getValue();

    // Field validation
    if (!password) {
      this.password.showError('Password is a required field');
      this.password.focus();
    } else {
      this.password.hideError();
    }

    if (!username) {
      this.emailAddress.showError('Email address is a required field.');
      this.emailAddress.focus();
    } else {
      this.emailAddress.hideError();
    }

    if (!username || !password) {
      return;
    }

    this.setState({ isLoading: true });

    // Send ajax request
    this.props.dispatch(ajaxPostLogin({
      data: {
        email_address: username,
        password,
      },
      onSuccess: () => {
        window.location.href = '/';
      },
      onFailure: () => {
        this.setState({
          isLoading: false,
          hasLoginError: true,
        });
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
            <h3>Sign in</h3>
            <hr />
            {
              this.state.hasLoginError && (
                <div className="alert alert-danger mb-25" role="alert">
                  The email address and/or password are incorrect.
                </div>
              )
            }
            <form onSubmit={this.onSubmit} className="nimbus-form">
              <Textbox
                ref={(c) => { this.emailAddress = c; }}
                label="Username / Email Address"
                placeholder="Username"
                name="title"
                required
              />
              <Textbox
                ref={(c) => { this.password = c; }}
                label="Password"
                placeholder="Password"
                inputType="password"
                name="title"
                required
              />
              <Button
                type="submit"
                name="Login"
                loadingName="Please Wait.."
                isLoading={this.state.isLoading}
                hasColor
              />
            </form>
            <nav className="text-center mt-20" style={{ fontSize: '12px' }}>
              <Link to="/forgot-password">Forgot Password</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<Link to="/register">Create Account</Link>
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
