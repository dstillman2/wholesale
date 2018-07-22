import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Checkbox controlled component
 */
class Checkbox extends Component {
  constructor(props) {
    super(props);

    this.state = { value: props.defaultChecked || false };
    this.uniqueIdentifier = Math.random().toString();

    this.handleChange = this.handleChange.bind(this);
  }

  getValue() {
    return this.state.value;
  }

  getField() {
    return this.field;
  }

  setValue(value) {
    this.setState({ value: value || false });
  }

  focus() {

  }

  hideError() {

  }

  showError() {

  }

  handleChange(event) {
    this.setState({ value: event.target.checked });

    if (this.props.onChange) {
      this.props.onChange(event.target.checked);
    }
  }


  render() {
    return (
      <div className="form-group">
        <div className="form-check">
          {
            !this.props.isStatic && (
              <label className="form-check-label" htmlFor={this.uniqueIdentifier}>
                <input
                  type="checkbox"
                  id={this.uniqueIdentifier}
                  className="form-check-input"
                  checked={this.state.value}
                  onChange={this.handleChange}
                />
                &nbsp;&nbsp;{this.props.label}
              </label>
            )
          }
        </div>
        {
          this.props.isStatic && (
            <div>
              {this.props.processStaticLabel(this.state.value, this.props.label)}
            </div>
          )
        }
        <div>
          {this.props.subLabel}
        </div>
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

Checkbox.defaultProps = {
  onChange: null,
  defaultValue: '',
  defaultSelected: null,
  label: '',
  uniqueIdentifier: Math.random().toString(),
  required: false,
  isStatic: false,
  checked: false,
  defaultChecked: false,
  processStaticLabel: (val, label) => label,
};

Checkbox.propTypes = {
  label: PropTypes.string,
  processStaticLabel: PropTypes.func,
  onChange: PropTypes.func,
  isStatic: PropTypes.bool,
  defaultChecked: PropTypes.bool,
};

export default Checkbox;
