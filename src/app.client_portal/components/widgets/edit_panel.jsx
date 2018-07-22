import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import Button from '../widgets/button';
import Loader from '../widgets/loader';

class EditPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      isStatic: true,
      isInitialLoad: true,
      hasError: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props[this.props.configs.store].data && !this.state.isFetching) {
      this.props.configs.fields.forEach((row) => {
        row.forEach((field) => {
          this[field.ref].setValue(
            this.props[this.props.configs.store].data[field.ref] || '',
          );
        });
      });
    }

    if (!this.props.closePanel && !prevState.isStatic) {
      this.setState({ isStatic: true });
    }
  }

  componentWillUnmount() {
    this.props.configs.ajax.updateDataInStore({});
  }

  onSubmit(e) {
    e.preventDefault();

    const fields = this.props.configs.fields;
    const data = {};

    let hasError = false;

    fields.slice().reverse().forEach((row) => {
      row.slice().reverse().forEach((field) => {
        if (field.isRequired) {
          data[field.ref] = this[field.ref].getValue();

          if (!data[field.ref]) {
            this[field.ref].showError(`${field.errorName} is a required field.`);
            this[field.ref].focus();
            hasError = true;
          }
        }
      });
    });

    if (hasError) {
      this.setState({ hasError: true });
    } else {
      this.setState({ hasError: false });
      this.update(data);
    }
  }

  fetch() {
    this.setState({ isFetching: true, error: null });

    this.props.dispatch(this.props.configs.ajax.fetch({
      onComplete: () => {
        this.setState({ isFetching: false, isInitialLoad: false });
      },
    }));
  }

  update(data) {
    this.setState({ isUpdating: true, error: null });

    this.props.dispatch(this.props.configs.ajax.update({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetch();
        this.setState({ isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error });
      },
      onComplete: () => {
        this.setState({ isUpdating: false });
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
                  <span>{this.props.configs.title}</span>
                  <div style={{ float: 'right' }}>
                    {
                      this.state.isStatic ? (
                        <Button
                          type="button"
                          name="Edit"
                          classes="btn btn-secondary-v2 mr-10"
                          isLoading={this.state.isUpdating || this.state.isFetching}
                          loadingName="Updating.."
                          onClick={() => {
                            if (this.props.configs.panelName || this.props.configs.store) {
                              this.props.onClickEdit(
                                this.props.configs.panelName || this.props.configs.store,
                              );
                            }

                            this.setState({ isStatic: false });
                          }}
                        />
                    ) : (
                      <Button
                        type="button"
                        name="Cancel"
                        classes="btn btn-secondary-v2 mr-10"
                        isLoading={this.state.isUpdating || this.state.isFetching}
                        loadingName="Cancel"
                        onClick={() => {
                          this.setState({ isStatic: true, hasError: false });
                          this.forceUpdate();
                        }}
                      />
                    )}
                  </div>
                </h5>
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
                    {
                      this.state.hasError && (
                        <div className="alert alert-danger mb-25" role="alert">
                          Please correct the errors highlighted in red below.
                        </div>
                      )
                    }
                    {
                      this.props.configs.fields.map((row, index) => (
                        <div className="row" key={`${index}`}>
                          {
                            row.map((field) => {
                              if (field.type === 'text') {
                                return (
                                  <div className={`col-md-${field.size}`} key={`${field.ref}`}>
                                    <Textbox
                                      ref={(c) => { this[`${field.ref}`] = c; }}
                                      label={field.label}
                                      placeholder={field.placeholder}
                                      defaultStaticText={field.defaultStaticText}
                                      isStatic={this.state.isStatic}
                                      required={field.isRequired}
                                    />
                                  </div>
                                );
                              }

                              return <div />;
                            })
                          }
                        </div>
                      ))
                    }
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
                                    type="button"
                                    name="Cancel"
                                    classes="btn btn-secondary square-border mr-10"
                                    loadingName="Cancel"
                                    isLoading={this.state.isUpdating}
                                    onClick={() => {
                                      this.setState({ isStatic: true, hasError: false });
                                      this.forceUpdate();
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

EditPanel.defaultProps = {
  closePanel: false,
};

EditPanel.propTypes = {
  configs: PropTypes.shape({
    title: PropTypes.string,
    store: PropTypes.string,
    panelName: PropTypes.string,
    ajax: PropTypes.object,
    fields: PropTypes.arrayOf(PropTypes.array).isRequired,
    requiredFields: PropTypes.object,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  onClickEdit: PropTypes.func.isRequired,
};

export default withRouter(connect(state => state)(EditPanel));
