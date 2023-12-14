'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var checkbox = require('@react-aria/checkbox');
var toggle = require('@react-stately/toggle');
var React = require('react');
var icon = require('@keystar/ui/icon');
var checkIcon = require('@keystar/ui/icon/icons/checkIcon');
var minusIcon = require('@keystar/ui/icon/icons/minusIcon');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');
var checkbox$1 = require('@react-stately/checkbox');
var core = require('@keystar/ui/core');
var field = require('@keystar/ui/field');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const CheckboxGroupContext = /*#__PURE__*/React__default["default"].createContext(null);

const checkboxClassList = new style.ClassList('Checkbox', ['indicator']);
function Checkbox(props) {
  let {
    isIndeterminate = false,
    isDisabled = false,
    autoFocus,
    children,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  let inputRef = React.useRef(null);

  // Swap hooks depending on whether this checkbox is inside a CheckboxGroup.
  // This is a bit unorthodox. Typically, hooks cannot be called in a conditional,
  // but since the checkbox won't move in and out of a group, it should be safe.
  let groupState = React.useContext(CheckboxGroupContext);
  let {
    inputProps
  } = groupState ?
  // eslint-disable-next-line react-hooks/rules-of-hooks
  checkbox.useCheckboxGroupItem({
    ...props,
    // Value is optional for standalone checkboxes, but required for
    // CheckboxGroup items; it's passed explicitly here to avoid
    // typescript error (requires ignore).
    // @ts-ignore
    value: props.value
  }, groupState.state, inputRef) :
  // eslint-disable-next-line react-hooks/rules-of-hooks
  checkbox.useCheckbox(props, toggle.useToggleState(props), inputRef);
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
    "data-disabled": isDisabled,
    className: style.classNames(styleProps.className, labelClassName),
    style: styleProps.style,
    children: [/*#__PURE__*/jsxRuntime.jsx(style.FocusRing, {
      autoFocus: autoFocus,
      children: /*#__PURE__*/jsxRuntime.jsx("input", {
        ...inputProps,
        ref: inputRef,
        className: style.classNames(style.css({
          position: 'absolute',
          zIndex: 1,
          inset: 0,
          opacity: 0.0001
        }))
      })
    }), /*#__PURE__*/jsxRuntime.jsx(Indicator, {
      isIndeterminate: isIndeterminate
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
    isIndeterminate
  } = props;
  return /*#__PURE__*/jsxRuntime.jsx("span", {
    className: style.classNames(style.css({
      backgroundColor: style.tokenSchema.color.background.canvas,
      borderRadius: style.tokenSchema.size.radius.small,
      color: style.tokenSchema.color.foreground.onEmphasis,
      display: 'flex',
      flexShrink: 0,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      height: sizeToken,
      width: sizeToken,
      // indicator icons
      [checkboxClassList.selector('indicator')]: {
        opacity: 0,
        transform: `scale(0) translate3d(0, 0, 0)`,
        transition: style.transition(['opacity', 'transform']),
        willChange: 'opacity, transform'
      },
      // focus ring
      '::after': {
        borderRadius: `calc(${style.tokenSchema.size.alias.focusRingGap} + ${style.tokenSchema.size.radius.small})`,
        content: '""',
        inset: 0,
        margin: 0,
        position: 'absolute',
        transition: style.transition(['box-shadow', 'margin'], {
          easing: 'easeOut'
        })
      },
      'input[type="checkbox"][data-focus=visible] + &::after': {
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
        transition: style.transition(['border-color', 'border-width'])
      },
      'input[type="checkbox"]:disabled + &': {
        color: style.tokenSchema.color.alias.foregroundDisabled,
        '&::before': {
          borderColor: style.tokenSchema.color.alias.borderDisabled
        }
      },
      'input[type="checkbox"]:enabled:hover + &::before': {
        borderColor: style.tokenSchema.color.alias.borderHovered
      },
      'input[type="checkbox"]:enabled:active + &::before': {
        borderColor: style.tokenSchema.color.alias.borderPressed
      },
      // checked states
      'input[type="checkbox"]:checked + &, input[type="checkbox"]:indeterminate + &': {
        '&::before': {
          borderWidth: `calc(${sizeToken} / 2)`
        },
        [checkboxClassList.selector('indicator')]: {
          opacity: 1,
          transform: `scale(1)`
        }
      },
      'input[type="checkbox"]:enabled:checked + &::before, input[type="checkbox"]:enabled:indeterminate + &::before': {
        borderColor: style.tokenSchema.color.scale.indigo9
      },
      'input[type="checkbox"]:enabled:checked:hover + &::before, input[type="checkbox"]:enabled:indeterminate:hover + &::before': {
        borderColor: style.tokenSchema.color.scale.indigo10
      },
      'input[type="checkbox"]:enabled:checked:active + &::before, input[type="checkbox"]:enabled:indeterminate:active + &::before': {
        borderColor: style.tokenSchema.color.scale.indigo11
      }
    })),
    children: /*#__PURE__*/jsxRuntime.jsx("span", {
      className: checkboxClassList.element('indicator'),
      children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
        size: "small",
        src: isIndeterminate ? minusIcon.minusIcon : checkIcon.checkIcon,
        strokeScaling: false
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
      'input[type="checkbox"]:hover ~ &': {
        color: style.tokenSchema.color.alias.foregroundHovered
      },
      'input[type="checkbox"]:disabled ~ &': {
        color: style.tokenSchema.color.alias.foregroundDisabled
      }
    })),
    ...props
  });
};

/**
 * A checkbox group allows users to select one or more items from a list of
 * choices.
 */
const CheckboxGroup = /*#__PURE__*/React.forwardRef(function CheckboxGroup(props, forwardedRef) {
  props = core.useProviderProps(props);
  props = field.validateFieldProps(props);
  let {
    children,
    orientation = 'vertical',
    validationState
  } = props;
  let state = checkbox$1.useCheckboxGroupState(props);
  let {
    labelProps,
    groupProps,
    descriptionProps,
    errorMessageProps
  } = checkbox.useCheckboxGroup(props, state);
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    ...props,
    ref: forwardedRef,
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps,
    supplementRequiredState: true,
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      ...groupProps,
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
      children: /*#__PURE__*/jsxRuntime.jsx(CheckboxGroupContext.Provider, {
        value: {
          validationState,
          state
        },
        children: children
      })
    })
  });
});

exports.Checkbox = Checkbox;
exports.CheckboxGroup = CheckboxGroup;
