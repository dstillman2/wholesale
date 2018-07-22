import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Select controlled component
 */
class Select extends Component {
  constructor(props) {
    super(props);

    let isValidValue = false;

    if (this.props.defaultValue) {
      isValidValue = props.options.reduce((a, b) => {
        if (b.value === this.props.defaultValue || a) {
          return true;
        }

        return false;
      }, false);
    }

    this.state = { value: (
      (isValidValue && this.props.defaultValue) ||
      (props.options[0] && props.options[0].value) ||
      ''
    ) };
    this.uniqueIdentifier = Math.random().toString();

    this.handleChange = this.handleChange.bind(this);
  }

  getValue() {
    return this.state.value || '';
  }

  getField() {
    return this.field;
  }

  showError(message) {
    this.setState({ error: message, hasError: true });
  }

  hideError() {
    this.setState({ error: null, hasError: false });
  }

  setValue(value) {
    let hasOption = false;
    this.props.options.forEach((option) => {
      if (option.value === value) {
        hasOption = true;
      }
    });

    if (hasOption) {
      this.setState({ value: String(value) || '' });
    }
  }

  focus() {
    if (!this.props.isStatic) {
      this.field.focus();
    }
  }

  handleChange(event) {
    this.hideError();
    this.setState({ value: event.target.value });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(event.target.value);
    }
  }


  render() {
    return (
      <div className="form-group">
        {
          this.props.label && (
            <label
              htmlFor={this.props.uniqueIdentifier}
              className={`${this.props.required && !this.props.isStatic ? 'require' : ''}`}
              style={{ textDecoration: this.props.isStatic ? 'underline' : 'none' }}
            >{this.props.label}</label>
          )
        }
        {
          !this.props.isStatic && typeof this.state.value === 'string' && (
            <select
              className={`form-control${this.state.hasError ? ' is-invalid' : ''}`}
              id={this.uniqueIdentifier}
              ref={(c) => { this.field = c; }}
              name={this.props.name}
              onChange={this.handleChange}
              value={this.state.value}
            >
              {
                this.props.defaultSelected ? (
                  <option value="" disabled selected>
                    {this.props.defaultSelected}]
                  </option>
                ) : null
              }
              {
                this.props.options.map((option, index) => (
                  <option key={option.key || index} value={option.value}>{option.label}</option>
                ))
              }
            </select>
          )
        }
        {
          this.props.isStatic && (
            <div style={{ textTransform: 'capitalize' }}>
              {this.props.processStaticText(this.state.value) || this.props.defaultStaticText}
            </div>
          )
        }
        <div
          className="invalid-feedback"
          style={this.state.hasError ? { display: 'block' } : { display: 'none' }}
        >
          {this.state.error}
        </div>
      </div>
    );
  }
}

Select.defaultProps = {
  onChange: null,
  defaultValue: '',
  defaultSelected: null,
  label: null,
  name: null,
  uniqueIdentifier: Math.random().toString(),
  required: false,
  isStatic: false,
  options: [],
  processStaticText: val => val,
};

Select.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isStatic: PropTypes.bool,
  defaultSelected: PropTypes.string,
  uniqueIdentifier: PropTypes.string,
  required: PropTypes.bool,
  processStaticText: PropTypes.func,
};

export default Select;
