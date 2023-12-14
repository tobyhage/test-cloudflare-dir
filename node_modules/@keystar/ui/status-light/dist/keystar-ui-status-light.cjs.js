'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var React = require('react');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils$1 = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');

/** Status lights describe the state or condition of an entity. */
const StatusLight = /*#__PURE__*/React.forwardRef(function StatusLight(props, forwardedRef) {
  let {
    children,
    role,
    tone = 'neutral'
  } = props;
  const styleProps = style.useStyleProps(props);
  if (!children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }
  if (!role && (props['aria-label'] || props['aria-labelledby'])) {
    console.warn('A labelled StatusLight must have a role.');
  }
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    ...utils.filterDOMProps(props, {
      labelable: true
    }),
    ...styleProps,
    ref: forwardedRef,
    "data-tone": tone,
    className: style.classNames(style.css({
      alignItems: 'center',
      color: style.tokenSchema.color.foreground.neutral,
      display: 'flex',
      gap: style.tokenSchema.size.space.regular,
      height: style.tokenSchema.size.element.small,
      // indicator
      '&::before': {
        content: '""',
        backgroundColor: style.tokenSchema.color.foreground.neutralTertiary,
        borderRadius: style.tokenSchema.size.radius.full,
        height: style.tokenSchema.size.scale[100],
        width: style.tokenSchema.size.scale[100]
      },
      // special case for neutral
      '&[data-tone=neutral]': {
        color: style.tokenSchema.color.foreground.neutralSecondary
      },
      '&[data-tone=accent]::before': {
        backgroundColor: style.tokenSchema.color.background.accentEmphasis
      },
      '&[data-tone=caution]::before': {
        backgroundColor: style.tokenSchema.color.background.cautionEmphasis
      },
      '&[data-tone=critical]::before': {
        backgroundColor: style.tokenSchema.color.background.criticalEmphasis
      },
      '&[data-tone=pending]::before': {
        backgroundColor: style.tokenSchema.color.background.pendingEmphasis
      },
      '&[data-tone=positive]::before': {
        backgroundColor: style.tokenSchema.color.background.positiveEmphasis
      }
    }), styleProps.className),
    children: utils$1.isReactText(children) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      color: "inherit",
      children: children
    }) : children
  });
});

exports.StatusLight = StatusLight;
