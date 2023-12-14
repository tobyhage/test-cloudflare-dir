'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var React = require('react');
var primitives = require('@keystar/ui/primitives');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const STROKE_VAR = `--${primitives.TOKEN_PREFIX}-icon-stroke`;
const Icon = props => {
  var _maybeTokenByKey;
  props = slots.useSlotProps(props, 'icon');
  const {
    strokeScaling,
    size,
    color,
    ...otherProps
  } = props;
  const stroke = (_maybeTokenByKey = style.maybeTokenByKey('color.foreground', color)) !== null && _maybeTokenByKey !== void 0 ? _maybeTokenByKey : 'currentColor';
  const iconClassName = style.css({
    fill: 'none',
    stroke: `var(${STROKE_VAR})`,
    flexShrink: 0,
    height: style.tokenSchema.size.icon.regular,
    width: style.tokenSchema.size.icon.regular,
    '&[data-size=small]': {
      height: style.tokenSchema.size.icon.small,
      width: style.tokenSchema.size.icon.small
    },
    '&[data-size=medium]': {
      height: style.tokenSchema.size.icon.medium,
      width: style.tokenSchema.size.icon.medium
    },
    '&[data-size=large]': {
      height: style.tokenSchema.size.icon.large,
      width: style.tokenSchema.size.icon.large
    },
    // Maintain stroke width, no matter the size.
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/vector-effect#non-scaling-stroke
    '&[data-stroke-scaling=false] > *': {
      vectorEffect: 'non-scaling-stroke'
    }
  });
  const styleProps = style.useStyleProps(otherProps);
  const hasAriaLabel = 'aria-label' in props && !!props['aria-label'];
  return /*#__PURE__*/React__default["default"].cloneElement(props.src, {
    ...style.toDataAttributes({
      strokeScaling,
      size
    }),
    ...utils.filterDOMProps(otherProps, {
      labelable: true
    }),
    'aria-hidden': !hasAriaLabel,
    focusable: 'false',
    role: 'img',
    className: style.classNames(iconClassName, styleProps.className),
    style: {
      [STROKE_VAR]: stroke,
      ...styleProps.style
    }
  });
};

exports.Icon = Icon;
