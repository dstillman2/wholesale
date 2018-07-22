import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Textbox controlled component
 */
class TextBox extends Component {
  constructor(props) {
    super(props);
    this.state = { value: String(this.props.defaultValue) };

    this.uniqueIdentifier = Math.random().toString();
    this.handleChange = this.handleChange.bind(this);
  }

  getValue() {
    if (typeof this.state.value === 'string') {
      return this.state.value.trim();
    }

    return this.state.value;
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
    this.hideError();

    if (typeof value === 'string') {
      this.setState({ value });
    } else {
      throw new Error('textbox must receive a string', value);
    }
  }

  focus() {
    if (!this.props.isStatic) {
      this.field.focus();
    }
  }

  clearAll() {
    this.setState({ value: '', error: null });
  }


  handleChange(event) {
    const restrict = this.props.restrict;

    const onChange = () => {
      this.hideError();

      if (typeof this.props.onChange === 'function') {
        this.props.onChange(event.target.value);
      }
    };

    if (restrict === 'floatOnly') {
      if (/^[0-9]*(\.?[0-9]?[0-9]?$)/.test(event.target.value)) {
        this.setState({ value: event.target.value, hasError: false, error: null });
        onChange();
      }
    } else if (restrict === 'intOnly') {
      if (/^[0-9]*$/.test(event.target.value)) {
        this.setState({ value: event.target.value, hasError: false, error: null });
        onChange();
      }
    } else if (restrict === 'einOnly') {
      if (/^([0-9]?[0-9]?|[0-9][0-9]-)[0-9]{0,7}$/.test(event.target.value)) {
        this.setState({ value: event.target.value, hasError: false, error: null });
        onChange();
      }
    } else if (restrict === 'noSpaces') {
      if (!/ /.test(event.target.value)) {
        this.setState({ value: event.target.value, hasError: false, error: null });
        onChange();
      }
    } else if (restrict === 'intAndNegInt') {
      if (/^-?[0-9]*(\.?[0-9]?[0-9]?$)/.test(event.target.value)) {
        this.setState({ value: event.target.value, hasError: false, error: null });
        onChange();
      }
    } else {
      this.setState({ value: event.target.value, hasError: false, error: null });
      onChange();
    }
  }

  clearField() {
    this.setState({ value: '' });
  }

  render() {
    return (
      <div className="form-group" style={{ position: 'relative' }}>
        {
          this.props.label && (
            <label
              htmlFor={this.uniqueIdentifier}
              className={`${this.props.required && !this.props.isStatic ? ' require' : ''}`}
              style={{ textDecoration: this.props.isStatic ? 'underline' : 'none' }}
            >
              {this.props.label}
            </label>
          )
        }
        {
          !this.props.isStatic && (typeof this.state.value === 'string' || typeof this.state.value === 'number') && (
            <input
              className={`form-control textbox-style${this.state.hasError ? ' is-invalid' : ''} ${this.props.addClassNames}`}
              id={this.uniqueIdentifier}
              ref={(c) => { this.field = c; }}
              tabIndex={this.props.tabIndex}
              maxLength={this.props.maxLength}
              value={this.state.value}
              onChange={this.handleChange}
              type={this.props.inputType}
              onClick={this.props.onClick}
              placeholder={this.props.placeholder}
            />
          )
        }
        {
          this.props.isStatic && (
            <div>{
                (this.props.processStaticValue && this.props.processStaticValue(this.state.value))
                || this.state.value || this.props.defaultStaticText}</div>
          )
        }
        <div
          className="invalid-feedback"
          style={this.state.error ? { display: 'block' } : { display: 'none' }}
        >
          {this.state.error}
        </div>
      </div>
    );
  }
}

TextBox.defaultProps = {
  inputType: 'text',
  defaultValue: '',
  placeholder: '',
  addClassNames: '',
  label: '',
  tabIndex: null,
  onChange: null,
  maxLength: null,
  required: false,
  defaultStaticText: '',
  isStatic: false,
  restrict: null,
  processStaticValue: null,
  onClick: () => {},
};

TextBox.propTypes = {
  onChange: PropTypes.func,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  addClassNames: PropTypes.string,
  label: PropTypes.string,
  maxLength: PropTypes.number,
  processStaticValue: PropTypes.func,
  inputType: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  defaultStaticText: PropTypes.node,
  isStatic: PropTypes.bool,
  restrict: PropTypes.string,
};

export default TextBox;
