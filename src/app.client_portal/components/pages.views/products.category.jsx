import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ProductCategoryEditPanel from './products.edit.category';
import {
  ajaxFetchCategories,
} from '../../actions/category.actions';
import Loader from '../widgets/loader';

class ProductCategory extends React.Component {
  constructor() {
    super();

    this.state = {
      isFetching: true,
    };

    this.createNewCategory = this.createNewCategory.bind(this);
  }

  componentDidMount() {
    this.fetchCategories();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.categories.list) {
      this.setState({
        categories: nextProps.categories.list,
      });
    }
  }

  fetchCategories() {
    this.setState({ isFetching: true, error: null });

    this.props.dispatch(ajaxFetchCategories({
      onComplete: () => {
        this.setState({ isFetching: false, isInitialLoad: false });
      },
    }));
  }

  createNewCategory(e) {
    e.preventDefault();

    if (this.state.hasPendingCategory) {
      return;
    }

    this.setState(prevState => ({
      hasPendingCategory: true,
      categories: [{
        options: '[]',
        field: '',
        onFinishCreation: () => this.setState({ hasPendingCategory: false }),
        isCreating: true,
      }, ...prevState.categories],
    }));
  }

  render() {
    return (
      <div id="categories" className="container nimbus-form">
        <div className="row mb-20">
          <div className="col-md-12">
            <button
              type="button"
              className="btn btn-secondary mr-10 btn-secondary-v3"
              style={{ textTransform: 'none' }}
              onClick={this.createNewCategory}
              disabled={this.state.hasPendingCategory}
            >
              Create New Category
            </button>
          </div>
        </div>
        <div className="relative">
          {
            this.state.isFetching && (
              <div className="loader">
                <Loader />
              </div>
            )
          }
          {
            !this.state.isFetching && this.state.categories.map((category, index) => (
              <div className="row" key={category.id || 'new'}>
                <div className="col-sm-12 col-md-8">
                  <ProductCategoryEditPanel
                    data={category}
                    {...this.props}
                  />
                </div>
              </div>
            ))
          }
          {
            !this.state.isFetching && this.state.categories.length === 0 && (
              <center><h5>No Categories have been created yet.</h5></center>
            )
          }
        </div>
      </div>
    );
  }
}

export default withRouter(connect(state => ({ categories: state.category }))(ProductCategory));
