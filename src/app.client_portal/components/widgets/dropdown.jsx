import React from 'react';
import PropTypes from 'prop-types';

class DropdownWidget extends React.Component {
  constructor() {
    super();

    this.state = {
      name: 'Sort by',
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  componentDidMount() {
    this.onWindowClick = () => {
      if (this.state.isDropdownActive) {
        this.setState({ isDropdownActive: false });
      }
    };

    window.addEventListener('click', this.onWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  toggleDropdown(e) {
    e.stopPropagation();

    this.setState(prevState => (
      {
        isDropdownActive: !prevState.isDropdownActive,
      }
    ));
  }

  render() {
    return (
      <div
        ref={(c) => { this.dropdown = c; }}
        className={`dropdown-widget dropdown ${this.props.externalClass}`}
        onClick={this.toggleDropdown}
      >
        <button className="btn btn-sm dropdown-toggle">
          {this.state.name}
        </button>
        <div
          className="dropdown-menu"
          style={{ display: `${this.state.isDropdownActive ? 'block' : 'none'}` }}
        >
          {
            this.props.items.map(item => (
              <button
                key={item.name}
                className="dropdown-item"
                onClick={() => {
                  this.setState({ name: item.name });
                  item.onClick();
                }}
              >
                {item.name}
              </button>
            ))
          }
        </div>
      </div>
    );
  }
}

DropdownWidget.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    onClick: PropTypes.func,
    name: PropTypes.string,
  })).isRequired,
};

export default DropdownWidget;
