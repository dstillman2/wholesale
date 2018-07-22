import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ImageUpload from '../../form_fields/image_upload';
import Button from '../../widgets/button';
import Loader from '../../widgets/loader';

import {
  ajaxFetchMarketplace,
  ajaxUpdateMarketplace,
  updateMarketplaceData,
  forceUpdateMarketplaceProps,
} from '../../../actions/marketplace.actions';

class MarketplaceEditMarketplace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: true,
      isInitialLoad: true,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchMarketplace();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      if (nextProps.data.logo_path) {
        this.logo_path.setValue(JSON.parse(nextProps.data.logo_path) || []);
      }
    }

    if (!nextProps.closePanel) {
      this.setState({ isStatic: true });
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateMarketplaceData({}));
  }

  onSubmit(e) {
    e.preventDefault();

    const data = {
      logo_path: JSON.stringify(this.logo_path.getValue()),
    };

    this.updateMarketplace(data);
  }

  fetchMarketplace() {
    this.setState({ isFetching: true, error: null });

    this.props.dispatch(ajaxFetchMarketplace({
      onComplete: () => {
        this.setState({ isFetching: false, isInitialLoad: false });
      },
    }));
  }

  updateMarketplace(data) {
    this.setState({ isUpdating: true, error: null });

    this.props.dispatch(ajaxUpdateMarketplace({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchMarketplace();
        this.setState({ isUpdating: false, isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error, isUpdating: false });
      },
    }));
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
                { this.state.isInitialLoad && isLoadingNode }
                <h5 className="card-title" style={{ float: 'right' }}>
                  <span>Logo</span>
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
                                this.props.onClickEdit('logo');
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
                                this.setState({ isStatic: true });
                                this.props.dispatch(forceUpdateMarketplaceProps());
                              }}
                            />
                          )
                        }
                      </div>
                    )
                  }
                </h5>
                <div className="card-body relative" style={{ padding: 30 }}>
                  { this.state.isEditLoading && isLoadingNode }
                  <div>
                    <div className="row">
                      <div className="col-md-12">
                        <ImageUpload
                          ref={(c) => { this.logo_path = c; }}
                          label="Upload your logo below."
                          name="upload[]"
                          restrictUploads={['gif', 'png', 'jpeg']}
                          title="Click to Upload"
                          isStatic={this.state.isStatic}
                          defaultStaticText="No logo has been uploaded."
                          staticUploadText="Uploaded Logo"
                          dispatch={this.props.dispatch}
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
                                      this.setState({ isStatic: true });
                                      this.props.dispatch(forceUpdateMarketplaceProps());
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

MarketplaceEditMarketplace.defaultProps = {
  data: {},
  isStatic: true,
};

MarketplaceEditMarketplace.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.object,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => Object.assign({}, state.marketplace, { settings: state.settings }))(MarketplaceEditMarketplace));
