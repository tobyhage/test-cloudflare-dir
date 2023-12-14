'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var date = require('@internationalized/date');
var datepicker = require('@react-aria/datepicker');
var i18n = require('@react-aria/i18n');
var datepicker$1 = require('@react-stately/datepicker');
var React = require('react');
var core = require('@keystar/ui/core');
var field = require('@keystar/ui/field');
var utils = require('@react-aria/utils');
var focus = require('@react-aria/focus');
var style = require('@keystar/ui/style');
var jsxRuntime = require('react/jsx-runtime');
var typography = require('@keystar/ui/typography');
var interactions = require('@react-aria/interactions');
var button = require('@keystar/ui/button');
var calendar = require('@keystar/ui/calendar');
var icon = require('@keystar/ui/icon');
var calendarDaysIcon = require('@keystar/ui/icon/icons/calendarDaysIcon');
var dialog = require('@react-aria/dialog');
var overlays = require('@keystar/ui/overlays');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const Input = /*#__PURE__*/React.forwardRef(function Input(props, forwardedRef) {
  let inputRef = utils.useObjectRef(forwardedRef);
  let {
    children,
    disableFocusRing,
    fieldProps,
    isDisabled,
    validationState
  } = props;
  let {
    focusProps,
    isFocusVisible,
    isFocused
  } = focus.useFocusRing({
    isTextInput: true,
    within: true
  });
  let isInvalid = validationState === 'invalid' && !isDisabled;
  let styleProps = useInputStyles(props, {
    isDisabled,
    isInvalid,
    isFocused,
    isFocusVisible: isFocusVisible && !disableFocusRing
  });
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    role: "presentation",
    ...utils.mergeProps(fieldProps, focusProps),
    ...styleProps,
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      role: "presentation",
      className: style.css({
        alignItems: 'center',
        display: 'inline-flex',
        height: '100%',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }),
      ref: inputRef,
      children: children
    })
  });
});
function useInputStyles(props, state) {
  let className = style.classNames(style.css({
    backgroundColor: style.tokenSchema.color.background.canvas,
    border: `${style.tokenSchema.size.border.regular} solid ${style.tokenSchema.color.alias.borderIdle}`,
    borderRadius: style.tokenSchema.size.radius.regular,
    cursor: 'text',
    height: style.tokenSchema.size.element.regular,
    lineHeight: style.tokenSchema.typography.lineheight.small,
    outline: 0,
    overflow: 'visible',
    paddingBlock: style.tokenSchema.size.space.small,
    paddingInline: style.tokenSchema.size.space.medium,
    position: 'relative',
    textIndent: 0,
    verticalAlign: 'top',
    minWidth: style.tokenSchema.size.scale[2000],
    width: '100%',
    '&[data-invalid]': {
      borderColor: style.tokenSchema.color.alias.borderInvalid
    },
    '&[data-focused]': {
      borderColor: style.tokenSchema.color.alias.borderFocused
    },
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 1px ${style.tokenSchema.color.alias.borderFocused}`
    },
    '&[data-disabled]': {
      backgroundColor: style.tokenSchema.color.alias.backgroundDisabled,
      borderColor: 'transparent'
    }
  }), props.className);
  return {
    ...style.toDataAttributes(state, {
      omitFalsyValues: true,
      trimBooleanKeys: true
    }),
    className,
    style: props.style
  };
}

const segmentClassList = new style.ClassList('InputSegment', ['editable']);
function InputSegment({
  segment,
  state,
  ...otherProps
}) {
  if (segment.type === 'literal') {
    return /*#__PURE__*/jsxRuntime.jsx(LiteralSegment, {
      segment: segment
    });
  }
  return /*#__PURE__*/jsxRuntime.jsx(EditableSegment, {
    segment: segment,
    state: state,
    ...otherProps
  });
}

/** A separator, e.g. punctuation like "/" or "." */
function LiteralSegment({
  segment
}) {
  return /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
    elementType: "span",
    "aria-hidden": "true",
    trim: false,
    UNSAFE_className: style.css({
      color: style.tokenSchema.color.foreground.neutral,
      userSelect: 'none',
      whiteSpace: 'pre',
      [`${segmentClassList.selector('editable')}[data-placeholder] ~ &`]: {
        color: style.tokenSchema.color.foreground.neutralTertiary
      }
    }),
    "data-testid": segment.type === 'literal' ? undefined : segment.type,
    children: segment.text
  });
}
function EditableSegment({
  segment,
  state
}) {
  let ref = React.useRef(null);
  let {
    segmentProps
  } = datepicker.useDateSegment(segment, state, ref);
  let styleProps = useEditableSectionStyles(segment);
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ...segmentProps,
    ...styleProps,
    style: {
      ...styleProps.style,
      ...segmentProps.style
    },
    ref: ref,
    "data-testid": segment.type,
    children: [/*#__PURE__*/jsxRuntime.jsx("span", {
      "aria-hidden": "true",
      "data-hidden": !segment.isPlaceholder,
      className: style.css({
        display: 'block',
        fontStyle: 'italic',
        height: '0',
        pointerEvents: 'none',
        textAlign: 'center',
        visibility: 'hidden',
        width: '100%',
        '&[data-hidden=false]': {
          height: 'auto',
          visibility: 'visible'
        }
      }),
      children: segment.placeholder
    }), !segment.isPlaceholder && segment.text]
  });
}
function useEditableSectionStyles(segment) {
  return {
    ...style.toDataAttributes({
      placeholder: segment.isPlaceholder,
      readonly: !segment.isEditable
    }, {
      omitFalsyValues: true
    }),
    className: style.classNames(style.css({
      borderRadius: style.tokenSchema.size.radius.small,
      color: style.tokenSchema.color.foreground.neutral,
      paddingInline: style.tokenSchema.size.space.xsmall,
      // text styles
      fontFamily: style.tokenSchema.typography.fontFamily.base,
      fontSize: style.tokenSchema.typography.text.regular.size,
      fontVariantNumeric: 'tabular-nums',
      fontWeight: style.tokenSchema.typography.fontWeight.regular,
      lineHeight: style.tokenSchema.typography.lineheight.small,
      whiteSpace: 'nowrap',
      MozOsxFontSmoothing: 'auto',
      WebkitFontSmoothing: 'auto',
      '[dir=ltr] &': {
        textAlign: 'right'
      },
      '[dir=rtl] &': {
        textAlign: 'left'
      },
      '&[data-placeholder]': {
        color: style.tokenSchema.color.foreground.neutralTertiary
      },
      '&:focus': {
        backgroundColor: style.tokenSchema.color.background.accentEmphasis,
        color: style.tokenSchema.color.foreground.onEmphasis,
        outline: 'none'
      }
    }), segmentClassList.element('editable')),
    style: {
      minWidth: segment.maxValue != null ? String(segment.maxValue).length + 'ch' : undefined
    }
  };
}

function useFormatHelpText(props) {
  let formatter = i18n.useDateFormatter({
    dateStyle: 'short'
  });
  let displayNames = datepicker.useDisplayNames();
  return React.useMemo(() => {
    if (props.description) {
      return props.description;
    }
    if (props.showFormatHelpText) {
      return formatter.formatToParts(new Date()).map(s => {
        if (s.type === 'literal') {
          return s.value;
        }
        return displayNames.of(s.type);
      }).join(' ');
    }
    return '';
  }, [props.description, props.showFormatHelpText, formatter, displayNames]);
}
function useVisibleMonths(maxVisibleMonths) {
  let [visibleMonths, setVisibleMonths] = React.useState(getVisibleMonths());
  utils.useLayoutEffect(() => {
    let onResize = () => setVisibleMonths(getVisibleMonths());
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return Math.max(1, Math.min(visibleMonths, maxVisibleMonths, 3));
}

// these calculations are brittle, they depend on styling decisions in both:
// - the `CalendarBase` component, from "@keystar/ui/calendar"
// - the `DatePickerPopover` component
function getVisibleMonths() {
  if (typeof window === 'undefined') {
    return 1;
  }
  let monthWidth = 248;
  let gap = 16;
  let dialogPadding = 20;
  return Math.floor((window.innerWidth - dialogPadding * 2) / (monthWidth + gap));
}
function useFocusManagerRef(ref) {
  let domRef = utils.useObjectRef(ref);
  React.useImperativeHandle(ref, () => ({
    ...domRef.current,
    focus() {
      focus.createFocusManager(domRef).focusFirst({
        tabbable: true
      });
    }
  }));
  return domRef;
}

function DateField(props, ref) {
  props = core.useProviderProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    isRequired
  } = props;
  let domRef = useFocusManagerRef(ref);
  let {
    locale
  } = i18n.useLocale();
  let state = datepicker$1.useDateFieldState({
    ...props,
    locale,
    createCalendar: date.createCalendar
  });
  let fieldRef = React.useRef(null);
  let inputRef = React.useRef(null);
  let {
    descriptionProps,
    errorMessageProps,
    fieldProps,
    inputProps,
    labelProps
  } = datepicker.useDateField({
    ...props,
    inputRef
  }, state, fieldRef);

  // Note: this description is intentionally not passed to useDatePicker.
  // The format help text is unnecessary for screen reader users because each segment already has a label.
  let description = useFormatHelpText(props);
  if (description && !props.description) {
    descriptionProps.id = undefined;
  }
  if (props.errorMessage) {
    state.validationState = 'invalid';
  }
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    ...props,
    ref: domRef,
    description: description,
    labelElementType: "span",
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps
    // validationState={state.validationState}
    ,
    children: /*#__PURE__*/jsxRuntime.jsxs(Input, {
      ref: fieldRef,
      fieldProps: fieldProps,
      isDisabled: isDisabled,
      autoFocus: autoFocus,
      validationState: state.validationState,
      children: [state.segments.map((segment, i) => /*#__PURE__*/jsxRuntime.jsx(InputSegment, {
        segment: segment,
        state: state,
        isDisabled: isDisabled,
        isReadOnly: isReadOnly,
        isRequired: isRequired
      }, i)), /*#__PURE__*/jsxRuntime.jsx("input", {
        ...inputProps,
        ref: inputRef
      })]
    })
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/**
 * DateFields allow users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
const _DateField = /*#__PURE__*/React__default["default"].forwardRef(DateField);

/** @private for internal use only. */
function DatePickerField(props) {
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    rangeFieldType
  } = props;
  let fieldRef = React.useRef(null);
  let inputRef = React.useRef(null);
  let {
    locale
  } = i18n.useLocale();
  let state = datepicker$1.useDateFieldState({
    ...props,
    locale,
    createCalendar: date.createCalendar
  });
  let {
    fieldProps,
    inputProps
  } = datepicker.useDateField({
    ...props,
    inputRef
  }, state, fieldRef);
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ...fieldProps,
    // @ts-expect-error
    "data-testid": props['data-testid'],
    "data-range": rangeFieldType,
    className: style.css({
      display: 'flex',
      '&[data-range=start]': {
        paddingInlineEnd: style.tokenSchema.size.space.regular
      },
      '&[data-range=end]': {
        paddingInlineStart: style.tokenSchema.size.space.regular
      }
    }),
    ref: fieldRef,
    children: [state.segments.map((segment, i) => /*#__PURE__*/jsxRuntime.jsx(InputSegment, {
      segment: segment,
      state: state,
      isDisabled: isDisabled,
      isReadOnly: isReadOnly,
      isRequired: isRequired
    }, i)), /*#__PURE__*/jsxRuntime.jsx("input", {
      ...inputProps,
      ref: inputRef
    })]
  });
}

function DatePickerPopover({
  state,
  ...props
}) {
  let scrollRef = React.useRef(null);
  let {
    direction
  } = i18n.useLocale();
  let isMobile = style.useIsMobileDevice();
  let {
    dialogProps
  } = dialog.useDialog(props.dialogProps, scrollRef);
  let content = /*#__PURE__*/jsxRuntime.jsx("div", {
    ref: scrollRef,
    className: style.css({
      display: 'flex',
      justifyContent: 'center',
      maxHeight: 'inherit',
      outline: 0,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }),
    ...dialogProps,
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      className: style.css({
        paddingInline: style.tokenSchema.size.space.medium,
        paddingTop: style.tokenSchema.size.space.medium,
        // bottom-padding fix for the scrollable area
        '&::after': {
          content: '""',
          display: 'block',
          height: style.tokenSchema.size.space.medium
        }
      }),
      children: props.children
    })
  });
  let overlay;
  if (isMobile) {
    overlay = /*#__PURE__*/jsxRuntime.jsx(overlays.Tray, {
      state: state,
      children: content
    });
  } else {
    overlay = /*#__PURE__*/jsxRuntime.jsx(overlays.Popover, {
      hideArrow: true,
      placement: direction === 'rtl' ? 'bottom right' : 'bottom left',
      scrollRef: scrollRef,
      shouldFlip: props.shouldFlip,
      state: state,
      triggerRef: props.triggerRef,
      children: content
    });
  }
  return overlay;
}

function DatePicker(props, forwardedRef) {
  props = core.useProviderProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    maxVisibleMonths = 1,
    pageBehavior
  } = props;
  let {
    hoverProps,
    isHovered
  } = interactions.useHover({
    isDisabled
  });
  let triggerRef = React.useRef(null);
  let domRef = useFocusManagerRef(forwardedRef);
  let state = datepicker$1.useDatePickerState(props);
  if (props.errorMessage) {
    state.validationState = 'invalid';
  }
  let {
    buttonProps,
    calendarProps,
    descriptionProps,
    dialogProps,
    errorMessageProps,
    fieldProps,
    groupProps,
    labelProps
  } = datepicker.useDatePicker(props, state, triggerRef);
  let {
    isFocused,
    isFocusVisible,
    focusProps
  } = focus.useFocusRing({
    within: true,
    isTextInput: true,
    autoFocus
  });
  let {
    isFocused: isFocusedButton,
    focusProps: focusPropsButton
  } = focus.useFocusRing({
    within: false,
    isTextInput: false,
    autoFocus
  });

  // Note: this description is intentionally not passed to useDatePicker.
  // The format help text is unnecessary for screen reader users because each segment already has a label.
  let description = useFormatHelpText(props);
  if (description && !props.description) {
    descriptionProps.id = undefined;
  }
  let visibleMonths = useVisibleMonths(maxVisibleMonths);
  let styleProps = usePickerStyles({
    isHovered,
    isFocused,
    isFocusVisible: isFocusVisible && !isFocusedButton,
    isDisabled,
    isReadOnly,
    isInvalid: state.validationState === 'invalid'
  });
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    ...props,
    ref: domRef,
    description: description,
    labelElementType: "span",
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps
    // validationState={state.validationState}
    ,
    children: /*#__PURE__*/jsxRuntime.jsxs("div", {
      ...utils.mergeProps(groupProps, hoverProps, focusProps),
      ...styleProps.root,
      ref: triggerRef,
      children: [/*#__PURE__*/jsxRuntime.jsx(Input, {
        isDisabled: isDisabled,
        validationState: state.validationState,
        disableFocusRing: true,
        ...styleProps.input,
        children: /*#__PURE__*/jsxRuntime.jsx(DatePickerField, {
          ...fieldProps,
          "data-testid": "date-field"
        })
      }), /*#__PURE__*/jsxRuntime.jsx(button.FieldButton, {
        ...utils.mergeProps(buttonProps, focusPropsButton),
        ...styleProps.button,
        validationState: state.validationState,
        isDisabled: isDisabled || isReadOnly,
        children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: calendarDaysIcon.calendarDaysIcon
        })
      }), /*#__PURE__*/jsxRuntime.jsx(DatePickerPopover, {
        dialogProps: dialogProps,
        shouldFlip: props.shouldFlip,
        state: state,
        triggerRef: triggerRef,
        children: /*#__PURE__*/jsxRuntime.jsx(calendar.Calendar, {
          ...calendarProps,
          visibleMonths: visibleMonths,
          pageBehavior: pageBehavior
        })
      })]
    })
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/**
 * DatePickers combine a DateField and a Calendar popover to allow users to
 * enter or select a date and time value.
 */
const _DatePicker = /*#__PURE__*/React__default["default"].forwardRef(DatePicker);
function usePickerStyles(state) {
  let root = {
    ...style.toDataAttributes(state, {
      omitFalsyValues: true,
      trimBooleanKeys: true
    }),
    className: style.css({
      borderRadius: style.tokenSchema.size.radius.regular,
      display: 'flex',
      position: 'relative',
      '&::after': {
        borderRadius: `inherit`,
        content: '""',
        inset: style.tokenSchema.size.border.regular,
        margin: 0,
        pointerEvents: 'none',
        position: 'absolute',
        transition: style.transition(['box-shadow', 'margin'], {
          easing: 'easeOut'
        })
      },
      '&[data-focus-visible]::after': {
        boxShadow: `0 0 0 ${style.tokenSchema.size.alias.focusRing} ${style.tokenSchema.color.alias.focusRing}`
      }
    })
  };
  let input = {
    className: style.css({
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
      borderInlineEndWidth: 0,
      [`.${root.className}[data-focused] &`]: {
        borderColor: style.tokenSchema.color.alias.borderFocused
      }
    })
  };
  let button = {
    UNSAFE_className: style.css({
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      [`.${root.className}[data-read-only] &`]: {
        borderColor: style.tokenSchema.color.alias.borderIdle
      },
      [`.${root.className}[data-invalid] &`]: {
        borderColor: style.tokenSchema.color.alias.borderInvalid
      },
      [`.${root.className}[data-focused] &`]: {
        borderColor: style.tokenSchema.color.alias.borderFocused
      },
      [`.${root.className}[data-disabled] &`]: {
        borderColor: 'transparent'
      }
    })
  };
  return {
    button,
    input,
    root
  };
}

function DateRangePicker(props, forwardedRef) {
  props = core.useProviderProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    maxVisibleMonths = 1,
    pageBehavior
  } = props;
  let {
    hoverProps,
    isHovered
  } = interactions.useHover({
    isDisabled
  });
  let triggerRef = React.useRef(null);
  let domRef = useFocusManagerRef(forwardedRef);
  let state = datepicker$1.useDateRangePickerState(props);
  if (props.errorMessage) {
    state.validationState = 'invalid';
  }
  let {
    buttonProps,
    calendarProps,
    descriptionProps,
    dialogProps,
    endFieldProps,
    errorMessageProps,
    groupProps,
    labelProps,
    startFieldProps
  } = datepicker.useDateRangePicker(props, state, triggerRef);
  let {
    isFocused,
    isFocusVisible,
    focusProps
  } = focus.useFocusRing({
    within: true,
    isTextInput: true,
    autoFocus
  });
  let {
    isFocused: isFocusedButton,
    focusProps: focusPropsButton
  } = focus.useFocusRing({
    within: false,
    isTextInput: false,
    autoFocus
  });

  // Note: this description is intentionally not passed to useDateRangePicker.
  // The format help text is unnecessary for screen reader users because each segment already has a label.
  let description = useFormatHelpText(props);
  if (description && !props.description) {
    descriptionProps.id = undefined;
  }
  let visibleMonths = useVisibleMonths(maxVisibleMonths);
  let styleProps = usePickerStyles({
    isHovered,
    isFocused,
    isFocusVisible: isFocusVisible && !isFocusedButton,
    isDisabled,
    isReadOnly,
    isInvalid: state.validationState === 'invalid'
  });
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    ...props,
    ref: domRef,
    description: description,
    labelElementType: "span",
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps
    // validationState={state.validationState}
    ,
    children: /*#__PURE__*/jsxRuntime.jsxs("div", {
      ...utils.mergeProps(groupProps, hoverProps, focusProps),
      ...styleProps.root,
      ref: triggerRef,
      children: [/*#__PURE__*/jsxRuntime.jsxs(Input, {
        isDisabled: isDisabled,
        validationState: state.validationState,
        disableFocusRing: true,
        ...styleProps.input,
        children: [/*#__PURE__*/jsxRuntime.jsx(DatePickerField, {
          rangeFieldType: "start",
          "data-testid": "start-date",
          ...startFieldProps
        }), /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
          "aria-hidden": "true",
          trim: false,
          children: '\u2014'
        }), /*#__PURE__*/jsxRuntime.jsx(DatePickerField, {
          rangeFieldType: "end",
          "data-testid": "end-date",
          ...endFieldProps
        })]
      }), /*#__PURE__*/jsxRuntime.jsx(button.FieldButton, {
        ...utils.mergeProps(buttonProps, focusPropsButton),
        ...styleProps.button,
        validationState: state.validationState,
        isDisabled: isDisabled || isReadOnly,
        children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: calendarDaysIcon.calendarDaysIcon
        })
      }), /*#__PURE__*/jsxRuntime.jsx(DatePickerPopover, {
        dialogProps: dialogProps,
        shouldFlip: props.shouldFlip,
        state: state,
        triggerRef: triggerRef,
        children: /*#__PURE__*/jsxRuntime.jsx(calendar.RangeCalendar, {
          ...calendarProps,
          visibleMonths: visibleMonths,
          pageBehavior: pageBehavior
        })
      })]
    })
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/**
 * DateRangePickers combine two DateFields and a RangeCalendar popover to allow users
 * to enter or select a date and time range.
 */
const _DateRangePicker = /*#__PURE__*/React__default["default"].forwardRef(DateRangePicker);

function TimeField(props, ref) {
  props = core.useProviderProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    isRequired
  } = props;
  let domRef = useFocusManagerRef(ref);
  let {
    locale
  } = i18n.useLocale();
  let state = datepicker$1.useTimeFieldState({
    ...props,
    locale
  });
  let inputRef = React.useRef(null);
  let {
    labelProps,
    fieldProps,
    descriptionProps,
    errorMessageProps
  } = datepicker.useTimeField(props, state, inputRef);
  if (props.errorMessage) {
    state.validationState = 'invalid';
  }
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    ...props,
    ref: domRef,
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps
    // validationState={state.validationState}
    ,
    children: /*#__PURE__*/jsxRuntime.jsx(Input, {
      ref: inputRef,
      fieldProps: fieldProps,
      isDisabled: isDisabled,
      autoFocus: autoFocus,
      validationState: state.validationState,
      children: state.segments.map((segment, i) => /*#__PURE__*/jsxRuntime.jsx(InputSegment, {
        segment: segment,
        state: state,
        isDisabled: isDisabled,
        isReadOnly: isReadOnly,
        isRequired: isRequired
      }, i))
    })
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/**
 * TimeFields allow users to enter and edit time values using a keyboard.
 * Each part of the time is displayed in an individually editable segment.
 */
const _TimeField = /*#__PURE__*/React__default["default"].forwardRef(TimeField);

exports.DateField = _DateField;
exports.DatePicker = _DatePicker;
exports.DateRangePicker = _DateRangePicker;
exports.TimeField = _TimeField;
