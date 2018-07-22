import React from 'react';

class Loader extends React.Component {
  render() {
    let style = {
      margin: '0 auto',
    };

    if (this.props.hasNoMargin) {
      style = {
        margin: '0 auto',
        width: 36,
        minHeight: 36,
        height: 36,
      };
    }

    return (
      <div className={`text-center ${this.props.hasNoMargin ? 'm-0' : 'm-40'}`}>
        <div
          className="spinner-circle-material"
          style={style}
        />
        {
          this.props.hasLoadingText && (
            <h5 >Loading...</h5>
          )
        }
      </div>
    );
  }
}

export default Loader;
