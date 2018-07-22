import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Textbox from '../form_fields/textbox';
import Select from '../form_fields/select';
import Checkbox from '../form_fields/checkbox';
import Textarea from '../form_fields/textarea';
import ImageUpload from '../form_fields/image_upload';
import InventoryTracking from '../widgets/inventory_tracking';
import Button from '../widgets/button';
import Loader from '../widgets/loader';
import NavBar from '../widgets/floating_footer';
import {
  ajaxFetchProduct,
  ajaxCreateProduct,
  ajaxUpdateProduct,
  ajaxDeleteProduct,
  updateProductData,
  forceUpdateProductProps,
} from '../../actions/product.actions';

const badge = value => <span className="badge badge-secondary text-uppercase no-radius ls-1">{value}</span>;

class ProductCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatic: props.isEditing,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
  }

  componentDidMount() {
    if (this.props.isEditing) {
      this.fetchProduct(this.props.match.params.id);
    } else {
      this.name.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.isEditing) {
      this.name.setValue(nextProps.data.name);
      this.description.setValue(nextProps.data.description || '');
      this.imageUploads.setValue(JSON.parse(nextProps.data.imageUploads));
      this.showInMarketplace.setValue(nextProps.data.isActiveMarketplace);
      this.price.setValue((nextProps.data.price / 100).toFixed(2));
      if (nextProps.data.hasInventoryTracking) {
        this.hasInventoryTracking.setValue('1');
        this.setState({ hasInventoryTracking: true });
      }
      if (typeof nextProps.data.inventory === 'number' && this.inventory) {
        this.inventory.setValue(String(nextProps.data.inventory));
      }
      if (nextProps.data.lead_time !== null && typeof nextProps.data.lead_time !== 'undefined') {
        this.lead_time.setValue(String(nextProps.data.lead_time) || '');
      } else {
        this.lead_time.setValue('');
      }

      let categoryCount = 0;

      if (typeof nextProps.data.categories === 'string') {
        JSON.parse(nextProps.data.categories).forEach((category) => {
          if (this[`category${category.id}`]) {
            this[`category${category.id}`].setValue(category.value);
            this.setState({ [`hasCategory${category.id}`]: category.value });

            if (category.value) {
              categoryCount += 1;
              this.setState({ [`hasSubCategory${category.id}`]: true });
            }

            if (category.subCategory) {
              this.setState({ [`subCategory${category.id}`]: category.subCategory });
            }
          }
        });
      }

      this.setState({ categoryCount });
    }
  }

  componentWillUnmount() {
    this.props.dispatch(updateProductData({}));
  }

  onSubmit(e) {
    e.preventDefault();

    const requiredFields = {
      name: {
        node: this.name,
        errorName: 'Product name',
      },
      price: {
        node: this.price,
        process: val => Number((Number(val) * 100).toFixed(0)),
        errorName: 'Price',
      },
      hasInventoryTracking: {
        node: this.hasInventoryTracking,
      },
    };

    let errors = {};
    let data = {};

    Object.entries(requiredFields).forEach(([key, field]) => {
      const process = field.process || (val => val);
      const val = field.node.getValue();

      field.node.hideError();

      if (field.func && !field.func(val) && field.errorName) {
        errors = Object.assign(errors, { [key]: true });
      } else if (!val && field.errorName) {
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
      });

      this.setState({ hasError: true });
    } else {
      this.setState({ hasError: false });

      const categories = this.props.settings.categories.data.map(category => (
        {
          id: category.id,
          value: this[`category${category.id}`].getValue(),
          subCategory: (this[`subCategory${category.id}`] && this[`subCategory${category.id}`].getValue()) || null,
        }
      ));

      data = Object.assign(data, {
        image_uploads: JSON.stringify(this.imageUploads.getValue()),
        categories: JSON.stringify(categories),
        lead_time: this.lead_time.getValue(),
        description: this.description.getValue(),
        is_active_marketplace: this.showInMarketplace.getValue(),
      });

      if (this.state.hasInventoryTracking) {
        const inventory = this.inventory;

        if (!inventory.getValue()) {
          inventory.showError('Inventory is a required field.');
          inventory.focus();

          return;
        }

        data = Object.assign(data, {
          isSellingOOS: this.isSellingOOS.getValue(),
          inventory: inventory.getValue(),
        });
      } else {
        data = Object.assign(data, { isSellingOOS: 0, inventory: null });
      }

      if (this.props.isEditing) {
        this.updateProduct(data);
      } else {
        this.createProduct(data);
      }
    }
  }

  fetchProduct(pathId) {
    this.setState({ isEditLoading: true, error: null });

    this.props.dispatch(ajaxFetchProduct({
      pathId,
      onComplete: () => {
        this.setState({ isEditLoading: false });
      },
    }));
  }

  createProduct(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxCreateProduct({
      data,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/products' });
      },
      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  updateProduct(data) {
    this.setState({ isLoading: true, error: null });

    this.props.dispatch(ajaxUpdateProduct({
      pathId: this.props.match.params.id,
      data,
      onSuccess: () => {
        this.fetchProduct(this.props.match.params.id);
        this.setState({ isLoading: false, isStatic: true });
      },
      onFailure: (error) => {
        this.setState({ error, isLoading: false });
      },
    }));
  }

  deleteProduct() {
    this.setState({ isDeleting: true, error: null });

    this.props.dispatch(ajaxDeleteProduct({
      pathId: this.props.match.params.id,
      onSuccess: () => {
        this.props.history.push({ pathname: '/account/products' });
      },
      onFailure: () => {
        this.setState({ error: 'Failed to delete this product. Please try again' });
        this.setState({ isDeleting: false });
      },
    }));
  }

  render() {
    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    const isLoadingNodeEmpty = <div className="loader blank-screen" />;

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    let navBar = () => (
      <NavBar>
        {
          !this.state.isStatic && (
            <div>
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
                    this.props.dispatch(forceUpdateProductProps());
                    this.setState({ isStatic: true, hasError: false });
                  } else {
                    this.props.history.push({ pathname: '/account/products' });
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
                      classes="btn btn-danger mr-10"
                      loadingName="DELETING.."
                      isLoading={this.state.isDeleting}
                      onClick={this.deleteProduct}
                    />
                  </div>
                )
              }
            </div>
          )
        }
        {
          this.state.isStatic && (
            <div>
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
                onClick={() => this.props.history.push({ pathname: '/account/products' })}
              >
                Back
              </button>
            </div>
          )
        }
      </NavBar>
    );

    if (!window.orderNimbusSettings.permissions.write.products) {
      navBar = () => <div />;
    }

    const categoryView = this.props.settings.categories.data.map((category) => {
      const label = category.field.replace('_', ' ');
      const options = JSON.parse(category.options).map(option => (
        {
          label: capitalizeFirstLetter(option.value),
          value: option.id,
        }
      ));

      function getLabel(id) {
        let returnVal = id;
        options.forEach((option) => {
          if (option.value === id) {
            returnVal = option.label;
          }
        });

        return returnVal;
      }

      const style = { overflow: 'auto' };

      if (this.state.isStatic && !this.state[`hasCategory${category.id}`]) {
        style.display = 'none';
      }

      return (
        <div
          key={category.id}
          style={style}
        >
          <Checkbox
            ref={(c) => { this[`category${category.id}`] = c; }}
            label={capitalizeFirstLetter(label)}
            onChange={(value) => {
              if (value) {
                this.setState({ [`hasSubCategory${category.id}`]: true });
              } else {
                this.setState({ [`hasSubCategory${category.id}`]: false });
              }
            }}
            isStatic={this.state.isStatic}
            processStaticLabel={(value, staticLabel) => {
              if (value) {
                return badge(staticLabel);
              }

              return '';
            }}
          />
          {
            this.state[`hasSubCategory${category.id}`] && (
              <div style={{ width: '95%', float: 'right' }}>
                <Select
                  ref={(c) => { this[`subCategory${category.id}`] = c; }}
                  options={[
                    {
                      label: 'Select a Subcategory..',
                      value: '',
                    },
                    ...options,
                  ]}
                  processStaticText={val => (val ? <span><u>Subcategory</u>: {`${getLabel(val)}`}</span> : '')}
                  defaultValue={this.state[`subCategory${category.id}`]}
                  defaultStaticText={<span className="badge badge-secondary text-uppercase no-radius ls-1">No Subcategory</span>}
                  isStatic={this.state.isStatic}
                />
              </div>
            )
          }
        </div>
      );
    });


    return (
      <div className="container nimbus-form">
        <form onSubmit={this.onSubmit} className={this.props.isEditing ? 'product-edit' : ''}>
          <div className="row">
            <div className="col-md-12">
              <div>
                {navBar()}
              </div>
            </div>
          </div>
          {
            this.state.hasError && (
              <div className="alert alert-danger mb-25" role="alert">
                Please correct the errors highlighted in red below.
              </div>
            )
          }
          <div className="row">
            <div className="col-md-7 col-xl-8">
              <div className="card">
                <h5 className="card-title">Product Info</h5>
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
                        <Textbox
                          ref={(c) => { this.name = c; }}
                          label="Product Name"
                          placeholder="Product Name"
                          type="text"
                          name="title"
                          required
                          isStatic={this.state.isStatic}
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.price = c; }}
                          label="Price ($)"
                          placeholder="i.e. 105.50"
                          type="text"
                          restrict="floatOnly"
                          maxLength={10}
                          required
                          isStatic={this.state.isStatic}
                        />
                      </div>
                      <div className="col-md-6">
                        <Textbox
                          ref={(c) => { this.lead_time = c; }}
                          label="Lead Time (days)"
                          placeholder="i.e. 14"
                          type="text"
                          restrict="intOnly"
                          maxLength={4}
                          defaultStaticText={badge('N/A')}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                      <div className="col-md-12">
                        <Textarea
                          ref={(c) => { this.description = c; }}
                          label="Description"
                          placeholder="Product description"
                          rows="6"
                          defaultStaticText={badge('N/A')}
                          isStatic={this.state.isStatic}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h5 className="card-title">Inventory</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <div className="row">
                    <div className="col-md-6">
                      <Select
                        ref={(c) => { this.hasInventoryTracking = c; }}
                        label="Track Inventory?"
                        options={[
                          {
                            label: 'No',
                            value: '0',
                          },
                          {
                            label: 'Yes',
                            value: '1',
                          },
                        ]}
                        onChange={(value) => {
                          if (value === '1') {
                            this.setState({ hasInventoryTracking: true });
                          } else {
                            this.setState({ hasInventoryTracking: false });
                          }
                        }}
                        processStaticText={val => (val === '0' ? 'No' : 'Yes')}
                        defaultStaticText={badge('Not Tracked')}
                        isStatic={this.state.isStatic}
                      />
                    </div>
                    <div className="col-md-6">
                      {
                        this.state.hasInventoryTracking && (
                          <Textbox
                            ref={(c) => { this.inventory = c; }}
                            label="Inventory"
                            placeholder="i.e. 14"
                            type="text"
                            restrict="intAndNegInt"
                            maxLength={8}
                            defaultValue={typeof this.props.data.inventory === 'number' ? this.props.data.inventory : ''}
                            defaultStaticText={badge('N/A')}
                            isStatic={this.state.isStatic}
                          />
                        )
                      }
                    </div>
                  </div>
                  {
                    this.state.hasInventoryTracking && (
                      <div className="row">
                        <div className="col-md-12">
                          <Checkbox
                            ref={(c) => { this.isSellingOOS = c; }}
                            label="Continue selling inventory when out of stock"
                            defaultChecked={this.props.data.isSellingOOS}
                            isStatic={this.state.isStatic}
                            processStaticLabel={(value) => {
                              if (value) {
                                return badge('Selling Inventory when Out of Stock');
                              }

                              return badge('Inventory Not Sold when Out of Stock');
                            }}
                          />
                        </div>
                      </div>
                    )
                  }
                  {
                    this.state.isStatic && !this.state.isEditing && this.props.data && this.props.data.hasInventoryTracking && (
                      <div>
                        <hr style={{ margin: '5px 0 15px 0', padding: 0 }} />
                        <div style={{ marginBottom: 10 }}>
                          <u><b>Change Inventory</b></u>
                        </div>
                        <div className="col-md-12">
                          <InventoryTracking
                            {...this.props}
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="card">
                <h5 className="card-title">Image Upload</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <ImageUpload
                    ref={(c) => { this.imageUploads = c; }}
                    label="If you have product images, please upload them below."
                    name="upload[]"
                    restrictUploads={['gif', 'png', 'jpeg']}
                    title="Upload Product Images (Click or Drag and Drop)"
                    isStatic={this.state.isStatic}
                    defaultStaticText="No images have been uploaded."
                    dispatch={this.props.dispatch}
                    isMultiple
                    hasActionLinks
                  />
                </div>
              </div>
            </div>
            <div className="col-md-5 col-xl-4">
              {
                this.props.settings && this.props.settings.categories && (
                  <div className="card">
                    <h5 className="card-title">Categories</h5>
                    <div className="card-body relative">
                      { this.state.isEditLoading && isLoadingNodeEmpty }
                      {
                        this.props.settings.categories.data.length === 0 && (
                          'No categories found.'
                        )
                      }
                      {
                        <div style={this.state.isStatic && this.state.categoryCount === 0 ? { display: 'none' } : {}}>
                          {categoryView}
                        </div>
                      }
                      {
                        this.state.isStatic && this.state.categoryCount === 0 && (
                          'No categories selected.'
                        )
                      }
                    </div>
                  </div>
                )
              }
              <div className="card">
                <h5 className="card-title">Marketplace</h5>
                <div className="card-body relative">
                  { this.state.isEditLoading && isLoadingNodeEmpty }
                  <Checkbox
                    ref={(c) => { this.showInMarketplace = c; }}
                    label="Show in Marketplace"
                    defaultChecked={!this.props.isEditing}
                    isStatic={this.state.isStatic}
                    processStaticLabel={(value) => {
                      if (value) {
                        return badge('Live in Marketplace');
                      }

                      return badge('Product Hidden in Marketplace');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {navBar()}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

ProductCreate.util = {
  processInventory: (value) => {
    if (!value) {
      return -1;
    }

    return value;
  },
};

ProductCreate.defaultProps = {
  data: {},
  isEditing: false,
};

ProductCreate.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.object,
};

export default withRouter(connect(state => Object.assign({}, state.products, { settings: state.settings }))(ProductCreate));
