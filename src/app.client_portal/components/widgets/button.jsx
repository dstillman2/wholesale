import React from 'react';

function Button(props) {
  let render;
  let style = {};

  if (props.isInlineBlock) {
    style = { display: 'inline-block', width: 'auto' };
  }

  let classes = `btn btn-bold btn-block large${props.hasSecondaryBtn ? ' btn-secondary' : ' btn-primary'} ${props.hasColor ? 'color' : ''}`;

  if (props.classes) {
    classes = props.classes;
  }

  if (!props.isLoading) {
    render = (
      <button
        className={classes}
        style={style}
        onClick={props.onClick}
        type={props.type}
      >
        {props.name}
      </button>
    );
  } else {
    render = (
      <button
        style={{ cursor: 'default' }}
        className={classes}
        type={props.type}
        disabled
      >
        {props.loadingName}
      </button>
    );
  }

  return render;
}

export default Button;
