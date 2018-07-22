import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from '../widgets/button';
import Loader from '../widgets/loader';
import { badgeEnabled, badgeDisabled } from '../widgets/badge';
import { ajaxPostSync } from '../../actions/quickbooks.actions';
import {
  ajaxFetchAccount,
  ajaxUpdateAccount,
} from '../../actions/account.actions';

class SettingsEditQuickbooks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: true,
      syncButtonText: 'Sync Quickbooks',
    };

    this.onSync = this.onSync.bind(this);
  }

  componentDidMount() {
    this.fetchAccount();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.closePanel) {
      this.setState({ isStatic: true });
    }
  }

  fetchAccount() {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxFetchAccount({
      onComplete: () => {
        this.setState({ isLoading: false, isInitialLoad: false });
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

  postSync() {
    this.setState({ isSyncing: true, error: null });

    this.props.dispatch(ajaxPostSync({
      onSuccess: () => {
        this.setState({ syncButtonText: 'Quickbooks Sync Requested', isSyncDisabled: true });
      },
      onComplete: () => {
        this.setState({ isSyncing: false });
      },
    }));
  }

  onSync() {
    this.postSync();
  }

  closePanel() {
    this.setState({ isStatic: true });
  }

  launchPopup(path) {
    let parameters = 'location=1,width=800,height=650';
    parameters += `,left=${(screen.width - 800) / 2},top=${(screen.height - 650) / 2}`;

    const popupWindow = window.open(path, 'connectPopup', parameters);

    const timer = setInterval(() => {
      if (popupWindow.closed) {
        this.fetchAccount();

        clearInterval(timer);
      }
    }, 1000);
  }

  render() {
    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    return (
      <div className="nimbus-form">
        <form onSubmit={this.onSubmit} className={this.props.isEditing ? 'product-edit' : ''}>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <h5 className="card-title" style={{ float: 'right' }}>
                  <span>Quickbooks</span>
                  <div style={{ float: 'right' }}>
                    {
                      this.state.isStatic ? (
                        <Button
                          type="button"
                          name="Edit"
                          classes="btn btn-secondary-v2 mr-10"
                          isLoading={this.state.isLoading}
                          loadingName={this.props.isEditing ? 'Updating..' : 'Loading..'}
                          onClick={() => {
                            this.props.onClickEdit('quickbooks');
                            this.setState({ isStatic: false });
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          name="Close"
                          classes="btn btn-secondary-v2 mr-10"
                          isLoading={this.state.isLoading}
                          loadingName={this.props.isEditing ? 'Updating..' : 'Loading..'}
                          onClick={() => {
                            this.setState({ isStatic: true, hasError: false });
                          }}
                        />
                      )
                    }
                  </div>
                </h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isLoading && isLoadingNode }
                  <div>
                    <div className="row">
                      <div className="col-md-12">
                        {
                          !this.state.isStatic && (
                            <div>
                              <div className="mb-10"><b>Click the button below to connect to QuickBooks or to change accounts.</b></div>
                              <a
                                className="imgLink"
                                href="#quickbooks"
                                onClick={() => this.launchPopup('/api/quickbooks/connect')}
                              >
                                <img
                                  style={{ height: 40 }}
                                  src="/static/images/qb.png"
                                  alt="Quickbooks"
                                />
                              </a>
                              <hr />
                            </div>
                          )
                        }
                        {
                          this.props.data.is_qb_enabled ? (
                            <div className="mb-10">
                              {badgeEnabled('QuickBooks is Linked')}
                            </div>
                          ) : (
                            <div className="mb-10">
                              {badgeDisabled('QuickBooks is not Linked')}
                            </div>
                          )
                        }
                        {
                          this.state.isStatic && this.props.data.isQbEnabled && (
                            <div>
                              <p>
                                QuickBook syncing is performed once a day. If you need to sync earlier, click the button below.
                              </p>
                              <Button
                                type="button"
                                name="Sync Quickbooks"
                                classes="btn btn-secondary mr-10"
                                isLoading={this.state.isSyncing || this.state.isSyncDisabled}
                                loadingName={this.state.isSyncing ? 'Requesting..' : 'Syncing in Progress.'}
                                onClick={this.onSync}
                                disabled={this.state.isSyncDisabled}
                              />
                            </div>
                          )
                        }
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
                                    name="Close"
                                    classes="btn btn-secondary square-border mr-10"
                                    loadingName="Close"
                                    isLoading={this.state.isUpdating}
                                    onClick={() => {
                                      this.setState({ isStatic: true, hasError: false });
                                    }}
                                  />
                                )
                              }
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

SettingsEditQuickbooks.defaultProps = {
  data: {},
  isEditing: false,
  isStatic: true,
};

SettingsEditQuickbooks.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.account, { settings: state.settings }))(SettingsEditQuickbooks));
