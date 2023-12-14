'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var radio = require('@react-aria/radio');
var React = require('react');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');
var radio$1 = require('@react-stately/radio');
var core = require('@keystar/ui/core');
var field = require('@keystar/ui/field');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const RadioContext = /*#__PURE__*/React__default["default"].createContext(null);
function useRadioProvider() {
  const context = React__default["default"].useContext(RadioContext);
  if (!context) {
    throw new Error('useRadioProvider must be used within a RadioGroupProvider');
  }
  return context;
}

const radioClassList = new style.ClassList('Radio', ['indicator']);
function Radio(props) {
  let {
    children,
    autoFocus,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  let inputRef = React.useRef(null);
  let radioGroupProps = useRadioProvider();
  let {
    state
  } = radioGroupProps;
  let {
    inputProps
  } = radio.useRadio({
    ...props,
    ...radioGroupProps
  }, state, inputRef);
  const inputClassName = style.css({
    position: 'absolute',
    zIndex: 1,
    inset: 0,
    opacity: 0.0001
  });
  const labelClassName = style.css({
    alignItems: 'flex-start',
    display: 'inline-flex',
    gap: style.tokenSchema.size.space.regular,
    position: 'relative',
    userSelect: 'none'
  });
  const slots$1 = React.useMemo(() => ({
    text: {
      color: 'inherit'
    },
    description: {
      color: 'neutralTertiary'
    }
  }), []);
  return /*#__PURE__*/jsxRuntime.jsxs("label", {
    className: style.classNames(styleProps.className, labelClassName),
    style: styleProps.style,
    children: [/*#__PURE__*/jsxRuntime.jsx(style.FocusRing, {
      autoFocus: autoFocus,
      children: /*#__PURE__*/jsxRuntime.jsx("input", {
        ...inputProps,
        ref: inputRef,
        className: style.classNames(inputClassName)
      })
    }), /*#__PURE__*/jsxRuntime.jsx(Indicator, {
      inputClassName: inputClassName
    }), /*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
      slots: slots$1,
      children: children && /*#__PURE__*/jsxRuntime.jsx(Content, {
        children: utils.isReactText(children) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
          children: children
        }) : children
      })
    })]
  });
}

// Styled components
// -----------------------------------------------------------------------------

let sizeToken = style.tokenSchema.size.element.xsmall;
const Indicator = props => {
  let {
    inputClassName
  } = props;
  return /*#__PURE__*/jsxRuntime.jsx("span", {
    className: style.classNames(style.css({
      backgroundColor: style.tokenSchema.color.background.canvas,
      borderRadius: style.tokenSchema.size.radius.full,
      color: style.tokenSchema.color.foreground.onEmphasis,
      display: 'flex',
      flexShrink: 0,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      height: sizeToken,
      width: sizeToken,
      // indicator icons
      [radioClassList.selector('indicator')]: {
        opacity: 0,
        transform: `scale(0) translate3d(0, 0, 0)`,
        transition: style.transition(['opacity', 'transform']),
        willChange: 'opacity, transform'
      },
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
      [`.${inputClassName}[data-focus=visible] + &::after`]: {
        boxShadow: `0 0 0 ${style.tokenSchema.size.alias.focusRing} ${style.tokenSchema.color.alias.focusRing}`,
        margin: `calc(${style.tokenSchema.size.alias.focusRingGap} * -1)`
      },
      // border / background
      '&::before': {
        border: `${style.tokenSchema.size.border.medium} solid ${style.tokenSchema.color.alias.borderIdle}`,
        borderRadius: `inherit`,
        content: '""',
        inset: 0,
        margin: 0,
        position: 'absolute',
        transition: style.transition(['border-color', 'border-width'], {
          duration: 'regular'
        })
      },
      [`.${inputClassName}:disabled + &`]: {
        color: style.tokenSchema.color.alias.foregroundDisabled,
        '&::before': {
          borderColor: style.tokenSchema.color.alias.borderDisabled
        }
      },
      [`.${inputClassName}:enabled:hover + &::before`]: {
        borderColor: style.tokenSchema.color.alias.borderHovered
      },
      [`.${inputClassName}:enabled:active + &::before`]: {
        borderColor: style.tokenSchema.color.alias.borderPressed
      },
      // checked states
      [`.${inputClassName}:checked + &`]: {
        '&::before': {
          borderWidth: `calc(${sizeToken} / 2)`
        },
        [radioClassList.selector('indicator')]: {
          opacity: 1,
          transform: `scale(1)`
        }
      },
      [`.${inputClassName}:enabled:checked + &::before`]: {
        borderColor: style.tokenSchema.color.scale.indigo9
      },
      [`.${inputClassName}:enabled:checked:hover + &::before`]: {
        borderColor: style.tokenSchema.color.scale.indigo10
      },
      [`.${inputClassName}:enabled:checked:active + &::before`]: {
        borderColor: style.tokenSchema.color.scale.indigo11
      }
    })),
    children: /*#__PURE__*/jsxRuntime.jsx("span", {
      className: radioClassList.element('indicator'),
      children: /*#__PURE__*/jsxRuntime.jsx("svg", {
        className: style.resetClassName,
        fill: "currentColor",
        height: 12,
        viewBox: "0 0 24 24",
        width: 12,
        children: /*#__PURE__*/jsxRuntime.jsx("circle", {
          cx: "12",
          cy: "12",
          r: "6"
        })
      })
    })
  });
};
const Content = props => {
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    className: style.classNames(style.css({
      color: style.tokenSchema.color.alias.foregroundIdle,
      display: 'grid',
      paddingTop: `calc((${sizeToken} - ${style.tokenSchema.typography.text.regular.capheight}) / 2)`,
      gap: style.tokenSchema.size.space.large,
      'input[type="radio"]:hover ~ &': {
        color: style.tokenSchema.color.alias.foregroundHovered
      },
      'input[type="radio"]:disabled ~ &': {
        color: style.tokenSchema.color.alias.foregroundDisabled
      }
    })),
    ...props
  });
};

/**
 * Radio groups allow users to select a single option from a list of mutually
 * exclusive options.
 */
const RadioGroup = /*#__PURE__*/React.forwardRef(function RadioGroup(props, forwardedRef) {
  props = core.useProviderProps(props);
  props = field.validateFieldProps(props);
  let {
    validationState,
    children,
    orientation = 'vertical'
  } = props;
  let state = radio$1.useRadioGroupState(props);
  let {
    radioGroupProps,
    labelProps,
    descriptionProps,
    errorMessageProps
  } = radio.useRadioGroup(props, state);
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    ...props,
    ref: forwardedRef,
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps,
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      ...radioGroupProps,
      ...style.toDataAttributes({
        orientation
      }),
      className: style.classNames(style.css({
        display: 'flex',
        gap: style.tokenSchema.size.space.large,
        '&[data-orientation="vertical"]': {
          flexDirection: 'column'
        }
      })),
      children: /*#__PURE__*/jsxRuntime.jsx(RadioContext.Provider, {
        value: {
          validationState,
          state
        },
        children: children
      })
    })
  });
});

exports.Radio = Radio;
exports.RadioGroup = RadioGroup;
