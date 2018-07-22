import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class SecondaryHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeLink: window.location.pathname,
    };

    this.setActiveLinkUsingWindowPathName = this.setActiveLinkUsingWindowPathName.bind(this);
  }

  componentWillReceiveProps() {
    this.setActiveLinkUsingWindowPathName();
  }

  setActiveLinkUsingWindowPathName() {
    window.requestAnimationFrame(() => {
      this.setState({
        activeLink: window.location.pathname,
      });
    });
  }

  render() {
    return (
      <header className="header header-inverse secondary-header" style={{ marginBottom: 0, overflow: 'hidden' }}>
        <div className="container" style={{ overflowY: 'hidden', overflowX: 'auto' }}>
          {
            this.props.headerTitle && (
              <div
                className="header-info"
                style={(() => (this.props.links.length > 0 ? { marginBottom: 0 } : {}))()}
              >
                <h2 style={(this.props.links.length === 0 ? { margin: '30px 0' } : { margin: '25px 0 15px 0' })}>
                  {this.props.headerTitle}
                  {
                    this.props.subTitle && (
                      <small className="subtitle">{this.props.subTitle}</small>
                    )
                  }
                </h2>
              </div>
            )
          }
          {
            this.props.links.length > 0 && (
              <div className="header-action">
                <nav className="nav">
                  {
                    this.props.links.map((item) => {
                      if (Object.prototype.hasOwnProperty.call(item, 'permissions') && !item.permissions) {
                        return null;
                      }

                      const isPathMatched = (
                        SecondaryHeader.util
                          .isPathMatched(this.state.activeLink, item.href, item.isExactMatch)
                      );

                      if (item.isShownOnlyIfMatched && !isPathMatched) {
                        return null;
                      }

                      if (
                        item.hideIfLocationContains
                        && new RegExp(item.hideIfLocationContains).test(window.location.href)) {
                        return null;
                      }

                      const style = {
                        textOverflow: 'ellipsis',
                        maxWidth: 200,
                        overflow: 'hidden',
                      };

                      if (item.hasNoLink) {
                        return (
                          <div
                            key={item.href}
                            style={item.hasBorderRight ? Object.assign({}, style, { borderRight: '1px solid #0e0e0e' }) : style}
                            className={`nav-link ${isPathMatched ? 'active' : ''}`}
                          >
                            {item.title}
                          </div>
                        );
                      }

                      return (
                        <Link
                          to={item.href}
                          key={item.href}
                          style={item.hasBorderRight ? { borderRight: '1px solid #0e0e0e' } : {}}
                          onClick={this.setActiveLinkUsingWindowPathName}
                          className={`nav-link ${isPathMatched ? 'active' : ''}`}
                        >
                          {item.title}
                        </Link>
                      );
                    })
                  }
                </nav>
              </div>
            )
          }
        </div>
      </header>
    );
  }
}

SecondaryHeader.util = {
  isPathMatched(activeLink, windowLocationHref, isExactMatch) {
    if (isExactMatch) {
      return activeLink === windowLocationHref;
    }

    return !!new RegExp(windowLocationHref).test(activeLink);
  },
};

SecondaryHeader.defaultProps = {
  headerTitle: '',
  subTitle: '',
  links: [],
  hasHeaderInfo: false,
};

SecondaryHeader.propTypes = {
  headerTitle: PropTypes.string,
  subTitle: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.object),
};

export default withRouter(connect(state => state.secondaryHeader)(SecondaryHeader));
