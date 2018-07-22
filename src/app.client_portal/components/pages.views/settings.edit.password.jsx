import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import Button from '../widgets/button';

import { ajaxUpdateUserPassword } from '../../actions/user.actions';

class SettingsEditPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: true,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.closePanel) {
      this.setState({ isStatic: true });
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const requiredFields = {
      current_password: {
        node: this.current_password,
        errorName: 'Current password',
      },
      password: {
        node: this.password,
        errorName: 'Password',
      },
      confirm_password: {
        node: this.confirm_password,
        errorName: 'Confirm password',
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

      return;
    }

    if (data.password.length < 6) {
      this.password.showError('Password must be at least 6 characters');
      this.setState({ hasError: true });
      return;
    }

    if (data.password !== data.confirm_password) {
      this.password.showError('Password must equal the confirm password field');
      this.confirm_password.showError('Password must equal the confirm password field');
      this.setState({ hasError: true });
      return;
    }

    this.setState({ hasError: false });
    this.updatePassword(data);
  }

  updatePassword(data) {
    this.setState({ isLoading: true, error: null, hasError: false });

    this.props.dispatch(ajaxUpdateUserPassword({
      pathId: this.props.match.params.id,
      data: { password: data.password, current_password: data.current_password },
      onSuccess: () => {
        this.setState({ isStatic: true, error: null });
        this.clearFields();
      },
      onFailure: (errorData) => {
        if (errorData.error.data.code === 105) {
          this.setState({ error: 'Your current password is incorrect', hasError: true });
        }
      },
      onComplete: () => {
        this.setState({ isLoading: false });
      },
    }));
  }

  clearFields() {
    this.password.clearAll();

    if (this.confirm_password) {
      this.confirm_password.clearAll();
    }

    if (this.current_password) {
      this.current_password.clearAll();
    }
  }

  closePanel() {
    this.setState({ isStatic: true });
  }

  render() {
    const isLoadingNodeEmpty = <div className="loader" />;

    return (
      <div className="nimbus-form">
        <form onSubmit={this.onSubmit} className={this.props.isEditing ? 'product-edit' : ''}>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <h5 className="card-title" style={{ float: 'right' }}>
                  <span>Change Password</span>
                  <div style={{ float: 'right' }}>
                    {
                      this.state.isStatic ? (
                        <Button
                          type="button"
                          name="Edit"
                          classes="btn btn-secondary-v2 mr-10"
                          isLoading={this.state.isLoading}
                          loadingName={this.props.isEditing ? 'Updating..' : 'Creating..'}
                          onClick={() => {
                            this.props.onClickEdit('password');
                            this.setState({ isStatic: false });
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          name="Cancel"
                          classes="btn btn-secondary-v2 mr-10"
                          isLoading={this.state.isLoading}
                          loadingName={this.props.isEditing ? 'Updating..' : 'Creating..'}
                          onClick={() => {
                            this.setState({ isStatic: true, hasError: false });
                            this.password.hideError();
                            this.clearFields();
                          }}
                        />
                      )
                    }
                  </div>
                </h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <div>
                    <div className="row">
                      <div className="col-md-12">
                        {
                          !this.state.isStatic && (
                            <div className="mb-2 text-right">
                              <span style={{ color: 'red' }}>*</span> is a required field
                            </div>
                          )
                        }
                        {
                          this.state.hasError && (
                            <div className="alert alert-danger mb-25" role="alert">
                              {this.state.error || 'Please correct the errors highlighted in red below.'}
                            </div>
                          )
                        }
                        {
                          !this.state.isStatic && (
                          <Textbox
                            ref={(c) => { this.current_password = c; }}
                            label="Current Password"
                            placeholder="Current Password"
                            inputType="password"
                            required
                            isStatic={this.state.isStatic}
                          />
                          )
                        }
                        <Textbox
                          ref={(c) => { this.password = c; }}
                          label="Password"
                          placeholder="Password"
                          inputType="password"
                          defaultStaticText="*******"
                          required
                          isStatic={this.state.isStatic}
                        />
                      </div>
                      {
                        !this.state.isStatic && (
                          <div className="col-md-12">
                            <Textbox
                              ref={(c) => { this.confirm_password = c; }}
                              label="Confirm Password"
                              placeholder="Confirm Password"
                              inputType="password"
                              required
                              isStatic={this.state.isStatic}
                            />
                          </div>
                        )
                      }
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
                                      this.password.hideError();
                                      this.clearFields();
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

SettingsEditPassword.defaultProps = {
  data: {},
  isEditing: false,
  isStatic: true,
};

SettingsEditPassword.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.products, { settings: state.settings }))(SettingsEditPassword));
