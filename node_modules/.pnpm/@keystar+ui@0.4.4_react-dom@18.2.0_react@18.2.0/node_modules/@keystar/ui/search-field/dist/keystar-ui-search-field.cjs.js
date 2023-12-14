'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var searchfield$1 = require('@react-aria/searchfield');
var utils = require('@react-aria/utils');
var searchfield = require('@react-stately/searchfield');
var React = require('react');
var button = require('@keystar/ui/button');
var searchIcon = require('@keystar/ui/icon/icons/searchIcon');
var icon = require('@keystar/ui/icon');
var layout = require('@keystar/ui/layout');
var style = require('@keystar/ui/style');
var textField = require('@keystar/ui/text-field');
var jsxRuntime = require('react/jsx-runtime');

/** Search fields are text fields, specifically designed for search behaviour. */
const SearchField = /*#__PURE__*/React.forwardRef(function SearchField(props, forwardedRef) {
  const {
    autoFocus,
    description,
    errorMessage,
    id,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    showIcon = true,
    ...styleProps
  } = props;
  let domRef = utils.useObjectRef(forwardedRef);
  let state = searchfield.useSearchFieldState(props);
  let {
    labelProps,
    inputProps,
    clearButtonProps,
    descriptionProps,
    errorMessageProps
  } = searchfield$1.useSearchField(props, state, domRef);
  let clearButtonVisible = state.value !== '' && !props.isReadOnly;
  let clearButton = /*#__PURE__*/jsxRuntime.jsx(button.ClearButton, {
    ...clearButtonProps,
    preventFocus: true,
    isDisabled: isDisabled
  });
  let startElement = /*#__PURE__*/jsxRuntime.jsx(layout.Flex, {
    alignItems: "center",
    flexShrink: 0,
    justifyContent: "center",
    pointerEvents: "none",
    width: "element.regular",
    children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
      src: searchIcon.searchIcon,
      color: props.isDisabled ? 'color.alias.foregroundDisabled' : 'neutralSecondary'
    })
  });
  return /*#__PURE__*/jsxRuntime.jsx(textField.TextFieldPrimitive, {
    ref: domRef,
    ...styleProps,
    isDisabled: isDisabled,
    isReadOnly: isReadOnly,
    isRequired: isRequired,
    label: label,
    labelProps: labelProps,
    inputProps: inputProps,
    inputWrapperProps: {
      className: style.css({
        input: {
          '&[data-adornment="start"]': {
            paddingInlineStart: 0
          },
          '&[data-adornment="end"]': {
            paddingInlineEnd: 0
          },
          '&[data-adornment="both"]': {
            paddingInline: 0
          }
        }
      })
    },
    description: description,
    descriptionProps: descriptionProps,
    errorMessage: errorMessage,
    errorMessageProps: errorMessageProps,
    startElement: showIcon && startElement,
    endElement: clearButtonVisible && clearButton
  });
});

exports.SearchField = SearchField;
