import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TextboxAjaxSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      isCustom: (
        props.isEditing && typeof props.isCustom === 'boolean'
        ? !props.isCustom : true),
    };

    this.uniqueIdentifier = Math.random().toString();

    this.handleChange = this.handleChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  componentDidMount() {
    this.fetch();

    if (this.props.defaultId && this.props.isEditing) {
      this.setValue(this.props.defaultId);
    } else if (this.props.defaultCustomStore && this.props.isEditing) {
      this.setState({
        value: this.props.formatItemDisplay(this.props.defaultCustomStore) || '',
        store: this.props.defaultCustomStore,
      });
    }
  }

  getValue() {
    if (this.props.hasNameCheck && this.state.store && !this.state.store.name) {
      return this.state.value;
    }

    if (this.state.store && Object.keys(this.state.store).length > 0) {
      return this.state.store;
    }

    return this.state.value;
  }

  onButtonClick(item) {
    this.setState({
      isCustom: false,
      hasError: false,
      value: this.props.formatItemDisplay(item),
      store: this.props.processStore(item),
    });

    if (typeof this.props.onSelection === 'function') {
      this.props.onSelection(item);
    }
  }

  fetch(searchValue = '') {
    this.setState({ isFetching: true });

    this.props.dispatch(this.props.fetch({
      data: {
        search: searchValue,
      },
      onSuccess: (response) => {
        this.setState({ data: response.data });
      },
      onComplete: () => {
        this.setState({ isFetching: false });
      },
    }));
  }

  editFetch(id) {
    this.setState({ isFetching: true });

    this.props.dispatch(this.props.editFetch({
      pathId: id,

      onSuccess: (response) => {
        this.setState({
          value: this.props.formatItemDisplay(response.data[0]),
          isCustom: false,
          store: this.props.formatStore(response.data[0]),
        });
      },
      onComplete: () => {
        this.setState({ isFetching: false });
      },
    }));
  }

  onSearch(value) {
    if (this.searchTimeoutId) {
      window.clearTimeout(this.searchTimeoutId);
    }

    this.searchTimeoutId = window.setTimeout(() => {
      this.fetch(value);

      this.searchTimeoutId = null;
    }, 200);
  }

  onBlur() {
    window.setTimeout(() => {
      if (this.props.noLinkBadge && !this.state.store) {
        this.fetch();
        this.setState({ value: '' });
      }

      this.setState({ hasSearchField: false });
    }, 200);
  }

  setValue(id) {
    this.editFetch(id);
  }

  handleChange(e) {
    e.preventDefault();

    const value = e.target.value;

    this.setState({
      value: e.target.value,
      isCustom: true,
      store: null,
      hasError: false,
    });

    this.onSearch(value);

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value);
    }
  }

  onFocus() {
    this.setState({ hasSearchField: true });
  }

  showError(message) {
    this.setState({ hasError: true });

    if (typeof message === 'string') {
      this.setState({ error: message });
    }
  }

  hideError() {
    this.setState({ error: null, hasError: false });
  }

  render() {
    return (
      <div className="form-group textbox-ajax">
        {
          this.props.label && (
            <label
              htmlFor={this.uniqueIdentifier}
              className={`${this.props.required && !this.props.isStatic ? ' require' : ''}`}
              style={{
                textDecoration: this.props.isStatic ? 'underline' : 'none',
              }}
            >
              {this.props.label}
            </label>
          )
        }
        {
          !this.props.isStatic && (
            <input
              className={`form-control textbox-style${this.state.hasError ? ' is-invalid' : ''}`}
              id={this.uniqueIdentifier}
              ref={(c) => { this.field = c; }}
              tabIndex={this.props.tabIndex}
              maxLength={this.props.maxLength}
              value={this.state.value}
              onChange={this.handleChange}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              placeholder={this.props.placeholder}
            />
          )
        }
        {
          this.state.hasSearchField && (
            <div
              ref={(c) => { this.searchField = c; }}
              className="search-field"
            >
              {
                this.state.isFetching ? (
                  <div className="spinner-circle-material" />
                ) : (
                  <ul>
                    {
                      this.state.data && this.state.data.map((item, index) => (
                        <li
                          key={index}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();

                              this.onButtonClick(item);
                            }}
                          >
                            {this.props.formatItemDisplay(item)}
                          </button>
                        </li>
                      ))
                    }
                    {
                      this.state.data && this.state.data.length === 0 && (
                        <li style={{ padding: 15 }}>No results found</li>
                      )
                    }
                  </ul>
                )
              }
            </div>
          )
        }
        {
          this.props.isStatic && (
            this.state.value || this.props.defaultStaticText
          )
        }
        {
          this.state.isCustom && this.props.noLinkBadge && this.props.showBadge && (
            <div className="badge badge-secondary badge-pill badge-position">Custom Customer</div>
          )
        }
        {
          !this.state.isCustom && this.props.noLinkBadge && this.props.showBadge && (
            <div className="badge badge-secondary badge-pill badge-position badge-primary">Existing Customer</div>
          )
        }
        {
          this.state.isCustom && this.props.showBadge && !this.props.noLinkBadge && (
            <div className="badge badge-secondary badge-pill badge-position">Custom Product</div>
          )
        }
        {
          !this.state.isCustom && this.props.showBadge && !this.props.noLinkBadge && (
            <div className="badge badge-secondary badge-pill badge-position badge-primary">
              Existing Product
            </div>
          )
        }
        <div
          className="invalid-feedback"
          style={typeof this.state.error === 'string' ? {} : { display: 'none' }}
        >
          {this.state.error}
        </div>
      </div>
    );
  }
}

TextboxAjaxSearch.defaultProps = {
  placeholder: '',
  label: '',
  tabIndex: null,
  defaultValue: '',
  onChange: null,
  maxLength: null,
  required: false,
  defaultStaticText: '',
  formatStore: value => value,
  processStore: value => value,
  isStatic: false,
  restrict: null,
};

TextboxAjaxSearch.propTypes = {
  onChange: PropTypes.func,
  formatStore: PropTypes.func,
  defaultValue: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  label: PropTypes.string,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  isStatic: PropTypes.bool,
};

export default TextboxAjaxSearch;
