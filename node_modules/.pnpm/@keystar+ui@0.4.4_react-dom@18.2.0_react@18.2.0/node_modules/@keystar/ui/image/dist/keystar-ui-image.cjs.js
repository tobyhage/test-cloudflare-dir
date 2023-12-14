'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var emery = require('emery');
var layout = require('@keystar/ui/layout');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var jsxRuntime = require('react/jsx-runtime');

const supportedProps = new Set(['loading', 'onError', 'onLoad', 'src']);
/**
 * A wrapper around the native image tag with support for common behaviour.
 */
function Image(props) {
  props = slots.useSlotProps(props, 'image');
  const {
    alt,
    aspectRatio,
    children,
    fit = 'cover',
    ...otherProps
  } = props;
  const styleProps = style.useStyleProps(otherProps);
  emery.warning(alt != null, 'The `alt` prop was not provided to an image. ' + 'Add `alt` text for screen readers, or set `alt=""` prop to indicate that the image ' + 'is decorative or redundant with displayed text and should not be announced by screen readers.');
  return /*#__PURE__*/jsxRuntime.jsxs(layout.AspectRatio, {
    value: aspectRatio,
    UNSAFE_className: styleProps.className,
    UNSAFE_style: styleProps.style,
    children: [/*#__PURE__*/jsxRuntime.jsx("img", {
      ...utils.filterDOMProps(otherProps, {
        propNames: supportedProps
      }),
      alt: alt,
      role: alt === '' ? 'presentation' : undefined,
      className: style.classNames(style.css({
        objectFit: fit
      }))
    }), children]
  });
}

exports.Image = Image;
