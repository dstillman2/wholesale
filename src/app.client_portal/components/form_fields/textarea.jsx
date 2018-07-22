import React from 'react';
import PropTypes from 'prop-types';

/**
 * Textarea controlled component
 */
class TextArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = { value: String(props.defaultValue) || '' };

    this.uniqueIdentifier = Math.random().toString();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate() {
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }

  getValue() {
    return this.field.value || '';
  }

  clearValue() {
    this.field.value = '';
  }

  showError(message) {
    this.setState({ error: message });
  }

  hideError() {
    this.setState({ error: null });
  }

  setValue(value) {
    this.hideError();

    this.setState({ value: String(value) || '' });
  }

  focus() {
    if (!this.props.isStatic) {
      this.field.focus();
    }
  }

  handleChange(event) {
    this.hideError();
    this.setState({ value: event.target.value || '' });
  }

  render() {
    return (
      <div className="form-group">
        {
          this.props.label && (
            <label
              className={`${this.props.required && !this.props.isStatic ? 'require' : ''}`}
              style={{ textDecoration: this.props.isStatic ? 'underline' : 'none' }}
              htmlFor={this.uniqueIdentifier}
            >
              {this.props.label}
            </label>
          )
        }
        {
          !this.props.isStatic && typeof this.state.value === 'string' && (
            <textarea
              ref={(e) => { this.field = e; }}
              className={`form-control${this.state.error ? ' is-invalid' : ''}`}
              id={this.uniqueIdentifier}
              key={this.uniqueIdentifier}
              name={this.props.name}
              rows={this.props.rows}
              value={this.state.value}
              onChange={this.handleChange}
              placeholder={this.props.placeholder}
              maxLength={this.props.maxLength}
            />
          )
        }
        {
          this.props.isStatic && (
            <div>{this.state.value || this.props.defaultStaticText}</div>
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

TextArea.defaultProps = {
  label: '',
  onChange: null,
  defaultValue: '',
  required: false,
  defaultStaticText: '',
};

TextArea.propTypes = {
  required: PropTypes.bool,
  defaultValue: PropTypes.string,
  defaultStaticText: PropTypes.any,
};

export default TextArea;
