import React from 'react';
import PropTypes from 'prop-types';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="row">
        <div className="col-md-6">
          <p className="text-center text-md-left">© 2018 Nimbus. All rights reserved.</p>
        </div>
        <div className="col-md-6">
          <ul className="nav nav-primary nav-dotted nav-dot-separated justify-content-center justify-content-md-end">
            {
              // <li className="nav-item">
              //   <a className="nav-link" href="/">OrderNimbus</a>
              // </li>
            }
          </ul>
        </div>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  heading: 'Dashboard',
};

Footer.propTypes = {
  heading: PropTypes.string,
};

export default Footer;
