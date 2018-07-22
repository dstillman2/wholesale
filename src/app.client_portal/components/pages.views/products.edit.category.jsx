import uuid from 'uuid/v4';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import TextboxClose from '../form_fields/textbox_close';
import Button from '../widgets/button';

import {
  ajaxFetchCategories,
  ajaxUpdateCategory,
  ajaxCreateCategory,
  ajaxDeleteCategory,
  forceUpdateCategoryProps,
} from '../../actions/category.actions';

class ProductCategory extends React.Component {
  constructor(props) {
    super(props);

    let isStatic = true;

    if (typeof props.data.isCreating === 'boolean') {
      isStatic = false;
    }

    this.state = {
      isStatic,
      isInitialLoad: true,
      options: JSON.parse(props.data.options),
    };

    this.options = {};

    this.onAddOption = this.onAddOption.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClickRemove = this.onClickRemove.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.options) {
      this.setState({
        options: JSON.parse(nextProps.data.options),
      });
    }
  }

  componentWillUnmount() {
    if (this.props.data.isCreating) {
      this.props.data.onFinishCreation();
    }
  }

  fetchCategories() {
    this.setState({ isFetching: true, error: null });

    this.props.dispatch(ajaxFetchCategories({
      onComplete: () => {
        this.setState({ isFetching: false });
      },
    }));
  }

  updateCategories(id, data) {
    this.setState({ isUpdating: true, error: null });

    this.props.dispatch(ajaxUpdateCategory({
      pathId: id,
      data,
      onSuccess: () => {
        window.location.href = window.location.href;
      },
      onFailure: (error) => {
        this.setState({ error, isUpdating: false });
      },
    }));
  }

  createCategory(id, data) {
    this.setState({ isCreating: true, error: null });

    this.props.dispatch(ajaxCreateCategory({
      data,
      onSuccess: () => {
        window.location.href = window.location.href;
      },
      onFailure: (error) => {
        this.setState({ error, isCreating: false });
      },
    }));
  }

  deleteCategory() {
    this.setState({ isDeleting: true, error: null });

    this.props.dispatch(ajaxDeleteCategory({
      pathId: this.props.data.id,
      onSuccess: () => {
        window.location.href = window.location.href;
      },
      onFailure: () => {
        this.setState({ isDeleting: false });
      },
    }));
  }

  closePanel() {
    this.props.dispatch(forceUpdateCategoryProps());

    if (!this.props.data.isCreating) {
      this.setState({ isStatic: true });
    }
  }

  onAddOption(e) {
    e.preventDefault();

    let hasErrors = false;

    Object.keys(this.options).reverse().forEach((option) => {
      if (!this.options[option]) {
        return;
      }

      const fieldValue = this.options[option].getValue();

      if (!fieldValue) {
        this.options[option].showError();
        this.options[option].focus();

        hasErrors = true;
      } else {
        this.options[option].hideError();
      }
    });

    if (!hasErrors) {
      this.setState(prevState => ({
        options: [...prevState.options, { id: uuid().replace(/-/g, '').toUpperCase(), value: '' }],
      }));
    }
  }

  onClickRemove(index) {
    const newOptions = [];

    this.state.options.forEach((option) => {
      if (option.id !== index) {
        newOptions.push(option);
      }
    });

    this.setState({ options: newOptions });
  }

  onSubmit(e) {
    e.preventDefault();

    if (!this.field.getValue()) {
      this.field.showError();
      this.field.focus();

      return;
    }

    let hasErrors = false;
    const options = [];

    Object.keys(this.options).reverse().forEach((option) => {
      if (!this.options[option]) {
        return;
      }

      const fieldValue = this.options[option].getValue();

      if (!fieldValue) {
        this.options[option].showError();
        this.options[option].focus();
        hasErrors = true;
      } else {
        options.push({
          id: option,
          value: fieldValue,
        });
      }
    });

    if (hasErrors) {
      return;
    }

    if (!this.props.data.isCreating) {
      this.updateCategories(this.props.data.id, {
        field: this.field.getValue(),
        options: JSON.stringify(options),
      });
    } else {
      this.createCategory(this.props.data.id, {
        field: this.field.getValue(),
        options: JSON.stringify(options),
      });
    }
  }

  render() {
    const data = this.props.data;

    return (
      <div className="nimbus-form">
        <form onSubmit={this.onSubmit} className="product-edit">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <h5 className="card-title" style={{ float: 'right' }}>
                  {
                    data.field ? (
                      <span>Category: {data.field}</span>
                    ) : (
                      <span>New Category</span>
                    )
                  }
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
                            this.setState({ isStatic: false });
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          name={data.field ? 'Close' : 'Cancel'}
                          classes="btn btn-secondary-v2 mr-10"
                          isLoading={this.state.isUpdating || this.state.isFetching}
                          loadingName="Updating..."
                          onClick={this.closePanel}
                        />
                      )
                    }
                  </div>
                </h5>
                {
                  !this.state.isStatic && (
                    <div className="card-body relative" style={{ padding: 30 }}>
                      <div>
                        <div className="row">
                          <div className="col-md-8">
                            <Textbox
                              ref={(c) => { this.field = c; }}
                              label="Category"
                              placeholder="i.e. Color"
                              defaultValue={data.field}
                              isStatic={this.state.isStatic}
                              required
                            />
                          </div>
                        </div>
                        <hr style={{ margin: '10px 0 15px 0' }} />
                        {
                          this.state.options.map(option => (
                            <div className="row" key={`${option}${option.id}`}>
                              <div className="col-sm-8">
                                <TextboxClose
                                  index={option.id}
                                  label={option.id === 0 ? 'Sub Category' : ''}
                                  ref={(c) => { this.options[`${option.id}`] = c; }}
                                  placeholder="i.e. Black"
                                  defaultValue={option.value}
                                  onClickRemove={this.onClickRemove}
                                  isStatic={this.state.isStatic}
                                  required
                                />
                              </div>
                            </div>
                          ))
                        }
                        <div className="row">
                          <div className="col-md-12">
                            <button
                              className="btn btn-secondary btn-secondary-v3"
                              onClick={this.onAddOption}
                            >
                              Add Sub Category
                            </button>
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
                                <div className="float-left">
                                  {
                                    !this.props.data.isCreating && (
                                      <Button
                                        type="submit"
                                        name="Delete"
                                        classes="btn btn-danger square-border"
                                        isLoading={this.state.isDeleting}
                                        loadingName="Deleting..."
                                        onClick={this.deleteCategory}
                                      />
                                    )
                                  }
                                </div>
                              )
                            }
                            {
                              !this.state.isStatic && (
                                <div className="float-right">
                                  {
                                    !this.state.isUpdating && (
                                      <Button
                                        type="submit"
                                        name={data.field ? 'Close' : 'Cancel'}
                                        classes="btn btn-secondary square-border mr-10"
                                        loadingName="Close"
                                        isLoading={this.state.isUpdating}
                                        onClick={() => {
                                          this.setState({ isStatic: true });
                                          this.props.dispatch(forceUpdateCategoryProps());
                                        }}
                                      />
                                    )
                                  }
                                  {
                                    this.props.data.isCreating ? (
                                      <Button
                                        type="submit"
                                        name="Create"
                                        classes="btn btn-primary square-border"
                                        isLoading={this.state.isCreating}
                                        loadingName="Creating..."
                                        onClick={this.onSubmit}
                                      />
                                    ) : (
                                      <Button
                                        type="submit"
                                        name="Update"
                                        classes="btn btn-primary square-border"
                                        isLoading={this.state.isUpdating}
                                        loadingName="Updating..."
                                        onClick={this.onSubmit}
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
                  )
                }
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

ProductCategory.defaultProps = {
  data: {},
  isStatic: true,
};

ProductCategory.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.object,
};

export default withRouter(connect(state => Object.assign({}, state.category, { settings: state.settings }))(ProductCategory));
