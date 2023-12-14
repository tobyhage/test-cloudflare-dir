'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var interactions = require('@react-aria/interactions');
var _switch = require('@react-aria/switch');
var toggle = require('@react-stately/toggle');
var React = require('react');
var core = require('@keystar/ui/core');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');

/**
 * Switches allow users to turn an individual option on or off.
 * They are usually used to activate or deactivate a specific setting.
 */
const Switch = /*#__PURE__*/React.forwardRef(function Switch(props, forwardedRef) {
  props = core.useProviderProps(props);
  let {
    autoFocus,
    children,
    ...otherProps
  } = props;
  let inputRef = React.useRef(null);
  let state = toggle.useToggleState(props);
  let {
    inputProps
  } = _switch.useSwitch(props, state, inputRef);
  let styleProps = useSwitchStyles(otherProps);
  const slots$1 = React.useMemo(() => ({
    text: {
      color: 'inherit'
    },
    description: {
      color: 'neutralTertiary'
    }
  }), []);
  return /*#__PURE__*/jsxRuntime.jsxs("label", {
    ...styleProps.label,
    ref: forwardedRef,
    children: [/*#__PURE__*/jsxRuntime.jsx(style.FocusRing, {
      autoFocus: autoFocus,
      children: /*#__PURE__*/jsxRuntime.jsx("input", {
        ...styleProps.input,
        ...inputProps,
        ref: inputRef
      })
    }), /*#__PURE__*/jsxRuntime.jsx("span", {
      ...styleProps.indicator
    }), children && /*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
      slots: slots$1,
      children: /*#__PURE__*/jsxRuntime.jsx("span", {
        ...styleProps.content,
        children: utils.isReactText(children) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
          children: children
        }) : children
      })
    })]
  });
});
function useSwitchStyles(props) {
  let {
    isDisabled = false,
    prominence,
    size,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  let {
    hoverProps,
    isHovered
  } = interactions.useHover({
    isDisabled
  });
  let labelClassName = style.css({
    alignItems: 'flex-start',
    display: 'inline-flex',
    gap: style.tokenSchema.size.space.regular,
    position: 'relative',
    userSelect: 'none',
    '--track-background-color': style.tokenSchema.color.background.accentEmphasis,
    '--track-height': style.tokenSchema.size.element.small,
    '--track-width': style.tokenSchema.size.element.large,
    '&[data-size="small"]': {
      '--track-height': style.tokenSchema.size.element.xsmall,
      '--track-width': style.tokenSchema.size.element.regular
    },
    '&[data-prominence="low"]': {
      '--track-background-color': style.tokenSchema.color.background.inverse
    }
  });
  let labelStyleProps = {
    ...styleProps,
    ...hoverProps,
    ...style.toDataAttributes({
      disabled: isDisabled || undefined,
      hovered: isHovered || undefined,
      prominence,
      size
    }),
    className: style.classNames(labelClassName, styleProps.className)
  };
  let inputStyleProps = {
    className: style.css({
      position: 'absolute',
      zIndex: 1,
      inset: `calc(${style.tokenSchema.size.space.regular} * -1)`,
      // expand hit area
      opacity: 0.0001
    })
  };
  let contentStyleProps = {
    className: style.css({
      color: style.tokenSchema.color.alias.foregroundIdle,
      display: 'grid',
      paddingTop: `calc((var(--track-height) - ${style.tokenSchema.typography.text.regular.capheight}) / 2)`,
      gap: style.tokenSchema.size.space.large,
      [`.${inputStyleProps.className}:hover ~ &`]: {
        color: style.tokenSchema.color.alias.foregroundHovered
      },
      [`.${inputStyleProps.className}:disabled ~ &`]: {
        color: style.tokenSchema.color.alias.foregroundDisabled
      }
    })
  };
  let indicatorStyleProps = {
    className: style.classNames(style.css({
      backgroundColor: style.tokenSchema.color.background.surfaceTertiary,
      borderRadius: style.tokenSchema.size.radius.full,
      display: 'inline-block',
      flexShrink: 0,
      height: 'var(--track-height)',
      position: 'relative',
      transition: style.transition('background-color'),
      width: 'var(--track-width)',
      willChange: 'transform',
      // focus ring
      '::after': {
        borderRadius: style.tokenSchema.size.radius.full,
        content: '""',
        inset: 0,
        margin: 0,
        position: 'absolute',
        transition: style.transition(['box-shadow', 'margin'], {
          easing: 'easeOut'
        })
      },
      [`.${inputStyleProps.className}[data-focus=visible] + &::after`]: {
        boxShadow: `0 0 0 ${style.tokenSchema.size.alias.focusRing} ${style.tokenSchema.color.alias.focusRing}`,
        margin: `calc(${style.tokenSchema.size.alias.focusRingGap} * -1)`
      },
      // handle
      '&::before': {
        backgroundColor: style.tokenSchema.color.background.canvas,
        border: `${style.tokenSchema.size.border.medium} solid ${style.tokenSchema.color.alias.borderIdle}`,
        borderRadius: `inherit`,
        boxSizing: 'border-box',
        content: '""',
        inlineSize: 'var(--track-height)',
        blockSize: 'var(--track-height)',
        insetBlockStart: 0,
        insetInlineStart: 0,
        margin: 0,
        position: 'absolute',
        transition: style.transition(['border-color', 'transform'])
      },
      [`.${inputStyleProps.className}:hover + &::before`]: {
        borderColor: style.tokenSchema.color.alias.borderHovered
      },
      [`.${inputStyleProps.className}:active + &::before`]: {
        borderColor: style.tokenSchema.color.alias.borderPressed
      },
      // checked state
      [`.${inputStyleProps.className}:checked + &`]: {
        backgroundColor: 'var(--track-background-color)',
        '&::before': {
          borderColor: 'var(--track-background-color)'
        },
        '[dir=ltr] &::before': {
          transform: `translateX(calc(var(--track-width) - 100%))`
        },
        '[dir=rtl] &::before': {
          transform: `translateX(calc(100% - var(--track-width)))`
        }
      },
      // disabled state
      [`.${inputStyleProps.className}:disabled + &`]: {
        backgroundColor: style.tokenSchema.color.alias.backgroundDisabled,
        '&::before': {
          backgroundColor: style.tokenSchema.color.alias.borderIdle,
          borderColor: style.tokenSchema.color.alias.backgroundDisabled
        }
      },
      [`.${inputStyleProps.className}:disabled:checked + &`]: {
        backgroundColor: style.tokenSchema.color.alias.borderIdle,
        '&::before': {
          backgroundColor: style.tokenSchema.color.alias.backgroundDisabled,
          borderColor: style.tokenSchema.color.alias.borderIdle
        }
      }
    }))
  };
  return {
    content: contentStyleProps,
    indicator: indicatorStyleProps,
    input: inputStyleProps,
    label: labelStyleProps
  };
}

exports.Switch = Switch;
