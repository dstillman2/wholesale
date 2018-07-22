import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class Header extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.onClick = this.onClick.bind(this);
    this.onClickLink = this.onClickLink.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  componentDidMount() {
    this.gearDropdownClickFunc = (event) => {
      if (!this.state.hasDropdownMenu) {
        this.setState({ hasDropdownMenu: true });
        event.stopPropagation();
      }
    };

    this.topbarNavigationClickFunc = (event) => {
      if (this.state.hasSidebarMenu) {
        event.stopPropagation();
      }
    };

    this.windowClickFunc = () => {
      if (this.state.hasDropdownMenu) {
        this.setState({ hasDropdownMenu: false });
      }

      if (this.state.hasSidebarMenu) {
        this.setState({ hasSidebarMenu: false });
      }
    };

    this.topbarNavigation.addEventListener('click', this.topbarNavigationClickFunc);
    this.gearDropdown.addEventListener('click', this.gearDropdownClickFunc);
    window.addEventListener('click', this.windowClickFunc);
  }

  componentWillUnmount() {
    this.topbarNavigation.removeEventListener('click', this.topbarNavigationClickFunc);
    this.gearDropdown.removeEventListener('click', this.gearDropdownClickFunc);
    window.removeEventListener('click', this.windowClickFunc);
  }

  onClick() {
    this.setState({ hasDropdownMenu: true });
  }

  onClickLink(e) {
    const className = e.currentTarget.className;

    if (className.indexOf('active') > -1) {
      e.preventDefault();
    }
  }

  toggleSidebar(e) {
    e.stopPropagation();
    this.setState({ hasSidebarMenu: true });
  }

  render() {
    const hasOrdersTab = (window.orderNimbusSettings.permissions.read.orders
    || window.orderNimbusSettings.permissions.write.orders);

    const hasProductsTab = (window.orderNimbusSettings.permissions.read.products
    || window.orderNimbusSettings.permissions.write.products);

    const hasCustomersTab = (window.orderNimbusSettings.permissions.read.customers
    || window.orderNimbusSettings.permissions.write.customers);

    const hasMarketplaceTab = true;

    return (
      <header className="topbar topbar-expand-lg topbar-secondary topbar-inverse">
        <div className="container">
          <div className="topbar-left">
            <button className="topbar-btn topbar-menu-toggler" onClick={this.toggleSidebar}>☰</button>
            <nav
              ref={(c) => { this.topbarNavigation = c; }}
              className="topbar-navigation"
              style={this.state.hasSidebarMenu ? { left: 0 } : {}}
            >
              <ul className="menu">
                <li className="menu-item remove-hover">
                  <div className="logo">ON</div>
                </li>
                {
                  hasOrdersTab && (
                    <li className="menu-item">
                      <NavLink to="/account/orders" className="menu-link" activeClassName="active" onClick={this.onClickLink}>
                        <span className="title">Orders</span>
                      </NavLink>
                    </li>
                  )
                }
                {
                  hasProductsTab && (
                    <li className="menu-item">
                      <NavLink to="/account/products" className="menu-link" activeClassName="active" onClick={this.onClickLink}>
                        <span className="title">Products</span>
                      </NavLink>
                    </li>
                  )
                }
                {
                  hasCustomersTab && (
                    <li className="menu-item">
                      <NavLink to="/account/customers" className="menu-link" activeClassName="active" onClick={this.onClickLink}>
                        <span className="title">Customers</span>
                      </NavLink>
                    </li>
                  )
                }
                {
                  hasMarketplaceTab && (
                    <li className="menu-item">
                      <NavLink to="/account/marketplace" className="menu-link" activeClassName="active" onClick={this.onClickLink}>
                        <span className="title">Store</span>
                      </NavLink>
                    </li>
                  )
                }
                <li className="menu-item">
                  <NavLink to="/account/dashboard" className="menu-link" activeClassName="active" onClick={this.onClickLink}>
                    <span className="title">Analytics</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="topbar-right">
            <ul ref={(c) => { this.gearDropdown = c; }} className="topbar-btns">
              <li className="dropdown">
                <button className="topbar-btn menu-link" style={{ background: '#97ab52' }} data-toggle="dropdown" onClick={this.onClick}>
                  {window.orderNimbusSettings.name} &darr;
                </button>
                <div className="dropdown-menu" style={{ display: this.state.hasDropdownMenu ? 'block' : 'none' }}>
                  <Link to="/account/settings" className="dropdown-item">Settings</Link>
                  <div className="dropdown-divider" />
                  <a href="/account/logout" className="dropdown-item">Logout</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
    );
  }
}

Header.defaultProps = {
  heading: 'Dashboard',
};

Header.propTypes = {
  heading: PropTypes.string,
};

export default Header;
