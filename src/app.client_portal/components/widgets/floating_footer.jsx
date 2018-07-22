import React from 'react';

class FloatingFooter extends React.Component {
  constructor() {
    super();

    const FOOTER_HEIGHT = 55;
    const clientHeight = document.body.clientHeight;
    const innerHeight = window.innerHeight;
    const scrollHeight = window.scrollY;

    this.state = {
      isBottomStatic: !(scrollHeight + innerHeight + FOOTER_HEIGHT >= clientHeight),
    };
  }

  componentDidMount() {
    this.listener = () => {
      const FOOTER_HEIGHT = 55;
      const clientHeight = document.body.clientHeight;
      const innerHeight = window.innerHeight;
      const scrollHeight = window.scrollY;

      if (scrollHeight + innerHeight + FOOTER_HEIGHT >= clientHeight) {
        if (!this.state.isBottomStatic) {
          this.setState({ isBottomStatic: true });
        }
      }

      if (scrollHeight < clientHeight - innerHeight - 200) {
        if (this.state.isBottomStatic) {
          this.setState({ isBottomStatic: false });
        }
      }
    };

    window.addEventListener('scroll', this.listener);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listener);
  }

  render() {
    const style = {
      textAlign: 'left',
      position: this.props.isForceStatic || this.state.isBottomStatic ? 'static' : 'fixed',
      bottom: this.props.isForceStatic || this.state.isBottomStatic ? 55 : 0,
      background: this.props.isForceStatic || this.state.isBottomStatic ? '#f3f5f7' : 'rgb(39, 44, 52)',
      borderTop: this.props.isForceStatic || this.state.isBottomStatic ? '1px solid #fff' : 0,
    };

    const style2 = {
      textAlign: 'left',
      position: 'static',
      background: '#f3f5f7',
      marginTop: 0,
      paddingTop: 0,
    };

    return (
      <div
        className="floating-footer"
        style={style2}
      >
        {this.props.children}
      </div>
    );
  }
}

export default FloatingFooter;
