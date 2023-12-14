'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var link = require('@react-aria/link');
var React = require('react');
var utils = require('@react-aria/utils');
var focus = require('@react-aria/focus');
var interactions = require('@react-aria/interactions');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var jsxRuntime = require('react/jsx-runtime');
var button = require('@react-aria/button');

function useTextLink({
  autoFocus,
  prominence = 'default'
}) {
  const headingContext = typography.useHeadingContext();
  const textContext = typography.useTextContext();
  const {
    focusProps,
    isFocusVisible
  } = focus.useFocusRing({
    autoFocus
  });
  const {
    hoverProps,
    isHovered
  } = interactions.useHover({});
  const fontWeight = headingContext ? undefined : style.tokenSchema.typography.fontWeight.medium;
  const dataOptions = {
    prominence,
    hover: isHovered ? 'true' : undefined,
    focus: isFocusVisible ? 'visible' : undefined
  };
  return {
    ...utils.mergeProps(hoverProps, focusProps),
    ...style.toDataAttributes(dataOptions),
    Wrapper: !textContext && !headingContext ? typography.Text : React.Fragment,
    className: style.classNames(style.css({
      color: style.tokenSchema.color.foreground.neutral,
      cursor: 'pointer',
      fontWeight,
      outline: 0,
      textDecoration: 'underline',
      textDecorationColor: style.tokenSchema.color.border.emphasis,
      textDecorationThickness: style.tokenSchema.size.border.regular,
      textUnderlineOffset: style.tokenSchema.size.border.medium,
      '&[data-hover="true"], &[data-focus="visible"]': {
        color: style.tokenSchema.color.foreground.neutralEmphasis,
        textDecorationColor: style.tokenSchema.color.foreground.neutral
      },
      '&[data-focus="visible"]': {
        textDecorationStyle: 'double'
      },
      '&[data-prominence="high"]': {
        color: style.tokenSchema.color.foreground.accent,
        textDecorationColor: style.tokenSchema.color.border.accent,
        '&[data-hover="true"], &[data-focus="visible"]': {
          textDecorationColor: style.tokenSchema.color.foreground.accent
        }
      }
    }))
  };
}

/** @private Forked variant where an "href" is provided. */
const TextLinkAnchor = /*#__PURE__*/React.forwardRef(function TextLink(props, forwardedRef) {
  const {
    children,
    download,
    href,
    hrefLang,
    ping,
    referrerPolicy,
    rel,
    target,
    ...otherProps
  } = props;
  const domRef = utils.useObjectRef(forwardedRef);
  const {
    Wrapper,
    ...styleProps
  } = useTextLink(props);
  const {
    linkProps
  } = link.useLink(otherProps, domRef);
  return /*#__PURE__*/jsxRuntime.jsx(Wrapper, {
    children: /*#__PURE__*/jsxRuntime.jsx("a", {
      ref: domRef,
      download: download,
      href: href,
      hrefLang: hrefLang,
      ping: ping,
      referrerPolicy: referrerPolicy,
      rel: rel,
      target: target,
      ...utils.mergeProps(linkProps, styleProps),
      children: children
    })
  });
});

const TextLinkButton = /*#__PURE__*/React.forwardRef(function TextLink(props, forwardedRef) {
  const {
    children,
    ...otherProps
  } = props;
  const domRef = utils.useObjectRef(forwardedRef);
  const {
    Wrapper,
    ...styleProps
  } = useTextLink(otherProps);
  const {
    buttonProps
  } = button.useButton({
    elementType: 'span',
    ...otherProps
  }, domRef);
  return /*#__PURE__*/jsxRuntime.jsx(Wrapper, {
    children: /*#__PURE__*/jsxRuntime.jsx("span", {
      ref: domRef,
      ...utils.mergeProps(buttonProps, styleProps),
      children: children
    })
  });
});

/**
 * Text links take users to another place in the application, and usually appear
 * within or directly following a sentence. Styled to resemble a hyperlink.
 */
const TextLink = /*#__PURE__*/React.forwardRef(function TextLink(props, forwardedRef) {
  if ('href' in props) {
    return /*#__PURE__*/jsxRuntime.jsx(TextLinkAnchor, {
      ...props,
      ref: forwardedRef
    });
  }
  return /*#__PURE__*/jsxRuntime.jsx(TextLinkButton, {
    ...props,
    ref: forwardedRef
  });
});

Object.defineProperty(exports, 'useLink', {
  enumerable: true,
  get: function () { return link.useLink; }
});
exports.TextLink = TextLink;
