'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var interactions = require('@react-aria/interactions');
var utils = require('@react-aria/utils');
var field = require('@keystar/ui/field');
var style = require('@keystar/ui/style');
var jsxRuntime = require('react/jsx-runtime');
var textfield = require('@react-aria/textfield');
var emery = require('emery');
var utils$1 = require('@react-stately/utils');

/** Internal component for default appearance and behaviour. */
const TextFieldPrimitive = /*#__PURE__*/React.forwardRef(function TextFieldPrimitive(props, forwardedRef) {
  const {
    autoFocus,
    description,
    descriptionProps,
    endElement,
    errorMessage,
    errorMessageProps,
    id,
    inputProps,
    inputWrapperProps,
    isDisabled,
    isMultiline = false,
    isRequired,
    label,
    labelProps,
    startElement,
    ...otherProps
  } = props;
  const InputElement = isMultiline ? 'textarea' : 'input';
  let {
    hoverProps,
    isHovered
  } = interactions.useHover({
    isDisabled
  });
  let inputClassName = useTextFieldStyles();
  let inputRef = utils.useObjectRef(forwardedRef);

  // Sits behind everything, should only trigger when the press is "through"
  // (e.g. `pointer-events: none`) a start or end element.
  // NOTE: When CSS supports the `:has()` selector, we can detect interactive
  // children and automatically apply pointer-event styles.
  let onIndicatorPressStart = () => {
    if (document.activeElement === inputRef.current) {
      return;
    }
    inputRef.current.focus();
  };
  let {
    pressProps
  } = interactions.usePress({
    isDisabled,
    onPressStart: onIndicatorPressStart,
    preventFocusOnPress: true
  });
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    isRequired: isRequired,
    description: description,
    descriptionProps: descriptionProps,
    errorMessage: errorMessage,
    errorMessageProps: errorMessageProps,
    label: label,
    labelProps: labelProps,
    ...otherProps,
    children: /*#__PURE__*/jsxRuntime.jsxs("div", {
      ...inputWrapperProps,
      ...hoverProps,
      className: style.classNames(style.css({
        display: 'flex',
        flex: '1 1 auto',
        position: 'relative',
        zIndex: 0
      }), inputWrapperProps === null || inputWrapperProps === void 0 ? void 0 : inputWrapperProps.className),
      children: [startElement, /*#__PURE__*/jsxRuntime.jsx(style.FocusRing, {
        autoFocus: autoFocus,
        isTextInput: true,
        children: /*#__PURE__*/jsxRuntime.jsx(InputElement, {
          ...inputProps,
          ...style.toDataAttributes({
            adornment: getAdornmentType(props),
            hovered: isHovered || undefined,
            multiline: isMultiline || undefined
          }),
          className: style.classNames(inputClassName, inputProps === null || inputProps === void 0 ? void 0 : inputProps.className),
          "data-adornment": getAdornmentType(props)
          // @ts-ignore FIXME: not sure how to properly resolve this type
          ,
          ref: inputRef,
          rows: isMultiline ? 1 : undefined
        })
      }), /*#__PURE__*/jsxRuntime.jsx(InputStateIndicator, {
        inputClassName: inputClassName,
        ...pressProps
      }), endElement]
    })
  });
});

// Styled components
// ----------------------------------------------------------------------------

function makeSiblingSelector(base) {
  return function siblingSelector(...selectors) {
    return selectors.map(s => `.${base}${s} + &`).join(', ');
  };
}
const InputStateIndicator = ({
  inputClassName,
  ...props
}) => {
  const s = makeSiblingSelector(inputClassName);
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    role: "presentation",
    ...props,
    className: style.css({
      backgroundColor: style.tokenSchema.color.background.canvas,
      border: `${style.tokenSchema.size.border.regular} solid ${style.tokenSchema.color.alias.borderIdle}`,
      borderRadius: style.tokenSchema.size.radius.regular,
      cursor: 'text',
      inset: 0,
      position: 'absolute',
      transition: style.transition(['border-color', 'box-shadow']),
      zIndex: -1,
      [s('[data-hovered]')]: {
        borderColor: style.tokenSchema.color.alias.borderHovered
      },
      [s(':invalid', '[aria-invalid]')]: {
        borderColor: style.tokenSchema.color.alias.borderInvalid
      },
      [s(':focus')]: {
        borderColor: style.tokenSchema.color.alias.borderFocused
      },
      [s(':focus:not([readonly])')]: {
        boxShadow: `0 0 0 1px ${style.tokenSchema.color.alias.borderFocused}`
      },
      [s(':disabled', '[aria-disabled]')]: {
        backgroundColor: style.tokenSchema.color.background.surfaceSecondary,
        borderColor: 'transparent',
        cursor: 'auto'
      }
    })
  });
};
function useTextFieldStyles() {
  return style.css({
    color: style.tokenSchema.color.foreground.neutral,
    flex: 1,
    fontFamily: style.tokenSchema.typography.fontFamily.base,
    fontSize: style.tokenSchema.typography.text.regular.size,
    fontWeight: style.tokenSchema.typography.fontWeight.regular,
    height: style.tokenSchema.size.element.regular,
    lineHeight: style.tokenSchema.typography.lineheight.small,
    outline: 0,
    overflow: 'visible',
    paddingBlock: style.tokenSchema.size.space.small,
    paddingInline: style.tokenSchema.size.space.medium,
    position: 'relative',
    textIndent: 0,
    textOverflow: 'ellipsis',
    verticalAlign: 'top',
    width: '100%',
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
    '::placeholder': {
      color: style.tokenSchema.color.foreground.neutralTertiary
    },
    '&:disabled, &[aria-disabled]': {
      color: style.tokenSchema.color.alias.foregroundDisabled,
      '::placeholder': {
        color: style.tokenSchema.color.alias.foregroundDisabled
      }
    },
    /* Remove the inner padding and cancel buttons for input[type="search"] in Chrome and Safari on macOS. */
    '&::-webkit-search-cancel-button, &::-webkit-search-decoration': {
      WebkitAppearance: 'none'
    },
    // TEXTAREA
    // ------------------------------

    '&[data-multiline]': {
      height: 'auto',
      lineHeight: style.tokenSchema.typography.lineheight.medium,
      minHeight: style.tokenSchema.size.scale['700'],
      overflow: 'auto',
      paddingBlock: style.tokenSchema.size.space.regular,
      resize: 'none'
    }
  });
}

// Utils
// ----------------------------------------------------------------------------

function getAdornmentType(props) {
  if (props.startElement && props.endElement) {
    return 'both';
  } else if (props.startElement) {
    return 'start';
  } else if (props.endElement) {
    return 'end';
  }
  return 'none';
}

function validateTextFieldProps(props) {
  // warn if `placeholder` is used without a `description` present
  emery.warning(!props.placeholder || !!props.description, 'Placeholder text is not accessible. Use the `description` prop to provide information that will aid user input.');
  return field.validateFieldProps(props);
}

const TextField = /*#__PURE__*/React.forwardRef(function TextField(props, forwardedRef) {
  props = validateTextFieldProps(props);
  let domRef = utils.useObjectRef(forwardedRef);
  let {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps
  } = textfield.useTextField(props, domRef);
  return /*#__PURE__*/jsxRuntime.jsx(TextFieldPrimitive, {
    ref: domRef,
    ...props,
    labelProps: labelProps,
    inputProps: inputProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps
  });
});

const TextArea = /*#__PURE__*/React.forwardRef(function TextArea({
  onChange,
  ...props
}, forwardedRef) {
  props = validateTextFieldProps(props);
  let domRef = utils.useObjectRef(forwardedRef);
  let [inputValue, setInputValue] = utils$1.useControlledState(props.value, props.defaultValue, () => {});
  let onHeightChange = React.useCallback(() => {
    let input = domRef.current;
    // Auto-grow unless an explicit height is set.
    if (!props.height && input) {
      let prevOverflow = input.style.overflow;
      // Firefox scroll position fix https://bugzilla.mozilla.org/show_bug.cgi?id=1787062
      let isFirefox = ('MozAppearance' in input.style);
      if (!isFirefox) {
        input.style.overflow = 'hidden';
      }
      input.style.height = 'auto';
      // offsetHeight - clientHeight accounts for the border/padding.
      input.style.height = `${input.scrollHeight + (input.offsetHeight - input.clientHeight)}px`;
      input.style.overflow = prevOverflow;
    }
  }, [domRef, props.height]);
  utils.useLayoutEffect(() => {
    if (domRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, inputValue, domRef]);
  let {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps
  } = textfield.useTextField({
    ...props,
    onChange: utils.chain(onChange, setInputValue),
    inputElementType: 'textarea'
  }, domRef);
  return /*#__PURE__*/jsxRuntime.jsx(TextFieldPrimitive, {
    ...props,
    ref: domRef,
    labelProps: labelProps,
    inputProps: inputProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps,
    isMultiline: true
  });
});

exports.TextArea = TextArea;
exports.TextField = TextField;
exports.TextFieldPrimitive = TextFieldPrimitive;
exports.validateTextFieldProps = validateTextFieldProps;
