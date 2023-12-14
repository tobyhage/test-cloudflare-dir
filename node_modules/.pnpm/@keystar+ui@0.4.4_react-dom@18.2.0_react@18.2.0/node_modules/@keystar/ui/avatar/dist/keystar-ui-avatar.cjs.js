'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var React = require('react');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var jsxRuntime = require('react/jsx-runtime');

/**
 * An avatar is a thumbnail representation of an entity, such as a user or an
 * organization.
 */
const Avatar = /*#__PURE__*/React.forwardRef(function Avatar(props, forwardedRef) {
  const {
    alt,
    size = 'regular',
    ...otherProps
  } = props;
  const styleProps = style.useStyleProps(otherProps);
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    ref: forwardedRef,
    role: "img",
    "aria-label": alt,
    "data-size": size === 'regular' ? undefined : size,
    ...styleProps,
    ...utils.filterDOMProps(otherProps),
    className: style.classNames(styleProps.className, style.css({
      alignItems: 'center',
      backgroundColor: style.tokenSchema.color.background.surfaceTertiary,
      borderRadius: '50%',
      display: 'inline-flex',
      flexShrink: 0,
      fontSize: 'var(--avatar-text-size)',
      height: 'var(--avatar-size)',
      justifyContent: 'center',
      overflow: 'hidden',
      width: 'var(--avatar-size)',
      userSelect: 'none',
      // sizes
      '--avatar-size': style.tokenSchema.size.element.regular,
      '--avatar-text-size': style.tokenSchema.typography.text.regular.size,
      '&[data-size=xsmall]': {
        '--avatar-size': style.tokenSchema.size.element.xsmall,
        '--avatar-text-size': style.tokenSchema.typography.text.small.size
      },
      '&[data-size=small]': {
        '--avatar-size': style.tokenSchema.size.element.small,
        '--avatar-text-size': style.tokenSchema.typography.text.small.size
      },
      '&[data-size=medium]': {
        '--avatar-size': style.tokenSchema.size.element.medium,
        '--avatar-text-size': style.tokenSchema.typography.text.medium.size
      },
      '&[data-size=large]': {
        '--avatar-size': style.tokenSchema.size.element.large,
        '--avatar-text-size': style.tokenSchema.typography.text.large.size
      },
      '&[data-size=xlarge]': {
        '--avatar-size': style.tokenSchema.size.element.xlarge,
        '--avatar-text-size': style.tokenSchema.typography.text.large.size
      }
    })),
    children: 'src' in props ? /*#__PURE__*/jsxRuntime.jsx("div", {
      className: style.css({
        height: '100%',
        width: '100%'
      }),
      style: {
        backgroundImage: `url(${props.src})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }
    }) : /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      "aria-hidden": true,
      color: "neutralSecondary",
      weight: "medium",
      UNSAFE_className: style.css({
        fontSize: 'inherit'
      }),
      children: getInitials(props.name, size)
    })
  });
});
function getInitials(name, size) {
  const words = name.split(' ');
  const first = words[0].charAt(0);
  const last = words[words.length - 1].charAt(0);
  if (size === 'xsmall') {
    return `${first}`.toUpperCase();
  }
  return `${first}${last}`.toUpperCase();
}

exports.Avatar = Avatar;
