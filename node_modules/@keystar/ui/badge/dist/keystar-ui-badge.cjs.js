'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var React = require('react');
var layout = require('@keystar/ui/layout');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils$1 = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');

/**
 * A badge is a decorative indicator used to either call attention to an item or
 * for communicating non-actionable, supplemental information.
 */
const Badge = /*#__PURE__*/React.forwardRef(function Badge(props, forwardedRef) {
  const {
    children,
    tone = 'neutral',
    ...otherProps
  } = props;
  const styleProps = style.useStyleProps(otherProps);
  const bg = tone === 'neutral' ? 'surfaceSecondary' : tone;
  const fg = tone === 'neutral' ? undefined : tone;
  const slots$1 = React.useMemo(() => ({
    icon: {
      color: fg
    },
    text: {
      trim: false,
      color: fg,
      weight: 'medium'
    }
  }), [fg]);
  return /*#__PURE__*/jsxRuntime.jsx(layout.Flex, {
    UNSAFE_className: styleProps.className,
    UNSAFE_style: styleProps.style,
    ref: forwardedRef,
    ...utils.filterDOMProps(otherProps, {
      labelable: true
    }),
    // appearance
    backgroundColor: bg,
    borderRadius: "full",
    height: "element.small",
    minWidth: 0,
    paddingX: "regular"
    // layout
    ,
    alignItems: "center",
    flexShrink: 0,
    gap: "small",
    inline: true,
    children: /*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
      slots: slots$1,
      children: utils$1.isReactText(children) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
        children: children
      }) : children
    })
  });
});

exports.Badge = Badge;
