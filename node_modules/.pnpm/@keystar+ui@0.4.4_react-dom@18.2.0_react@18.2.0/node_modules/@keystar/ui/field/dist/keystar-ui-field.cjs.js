'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var label = require('@react-aria/label');
var layout = require('@keystar/ui/layout');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var React = require('react');
var i18n = require('@react-aria/i18n');
var ts = require('@keystar/ui/utils/ts');
var jsxRuntime = require('react/jsx-runtime');
var alertTriangleIcon = require('@keystar/ui/icon/icons/alertTriangleIcon');
var icon = require('@keystar/ui/icon');
var index = require('../../slots/dist/keystar-ui-slots.cjs.js');

var localizedMessages = {
	"ar-AE": {
		"(optional)": "(اختياري)",
		"(required)": "(مطلوب)"
	},
	"bg-BG": {
		"(optional)": "(незадължително)",
		"(required)": "(задължително)"
	},
	"cs-CZ": {
		"(optional)": "(volitelně)",
		"(required)": "(požadováno)"
	},
	"da-DK": {
		"(optional)": "(valgfrit)",
		"(required)": "(obligatorisk)"
	},
	"de-DE": {
		"(optional)": "(optional)",
		"(required)": "(erforderlich)"
	},
	"el-GR": {
		"(optional)": "(προαιρετικό)",
		"(required)": "(απαιτείται)"
	},
	"en-US": {
		"(optional)": "(optional)",
		"(required)": "(required)"
	},
	"es-ES": {
		"(optional)": "(opcional)",
		"(required)": "(necesario)"
	},
	"et-EE": {
		"(optional)": "(valikuline)",
		"(required)": "(nõutav)"
	},
	"fi-FI": {
		"(optional)": "(valinnainen)",
		"(required)": "(pakollinen)"
	},
	"fr-FR": {
		"(optional)": "(facultatif)",
		"(required)": "(requis)"
	},
	"he-IL": {
		"(optional)": "(אופציונלי)",
		"(required)": "(נדרש)"
	},
	"hr-HR": {
		"(optional)": "(opcionalno)",
		"(required)": "(obvezno)"
	},
	"hu-HU": {
		"(optional)": "(opcionális)",
		"(required)": "(kötelező)"
	},
	"it-IT": {
		"(optional)": "(facoltativo)",
		"(required)": "(obbligatorio)"
	},
	"ja-JP": {
		"(optional)": "（オプション）",
		"(required)": "（必須）"
	},
	"ko-KR": {
		"(optional)": "(선택 사항)",
		"(required)": "(필수 사항)"
	},
	"lt-LT": {
		"(optional)": "(pasirenkama)",
		"(required)": "(privaloma)"
	},
	"lv-LV": {
		"(optional)": "(neobligāti)",
		"(required)": "(obligāti)"
	},
	"nb-NO": {
		"(optional)": "(valgfritt)",
		"(required)": "(obligatorisk)"
	},
	"nl-NL": {
		"(optional)": "(optioneel)",
		"(required)": "(vereist)"
	},
	"pl-PL": {
		"(optional)": "(opcjonalne)",
		"(required)": "(wymagane)"
	},
	"pt-BR": {
		"(optional)": "(opcional)",
		"(required)": "(obrigatório)"
	},
	"pt-PT": {
		"(optional)": "(opcional)",
		"(required)": "(obrigatório)"
	},
	"ro-RO": {
		"(optional)": "(opţional)",
		"(required)": "(obligatoriu)"
	},
	"ru-RU": {
		"(optional)": "(дополнительно)",
		"(required)": "(обязательно)"
	},
	"sk-SK": {
		"(optional)": "(nepovinné)",
		"(required)": "(povinné)"
	},
	"sl-SI": {
		"(optional)": "(opcijsko)",
		"(required)": "(obvezno)"
	},
	"sr-SP": {
		"(optional)": "(opciono)",
		"(required)": "(obavezno)"
	},
	"sv-SE": {
		"(optional)": "(valfritt)",
		"(required)": "(krävs)"
	},
	"tr-TR": {
		"(optional)": "(isteğe bağlı)",
		"(required)": "(gerekli)"
	},
	"uk-UA": {
		"(optional)": "(необов’язково)",
		"(required)": "(обов’язково)"
	},
	"zh-CN": {
		"(optional)": "（可选）",
		"(required)": "（必填）"
	},
	"zh-TW": {
		"(optional)": "(選填)",
		"(required)": "(必填)"
	}
};

const FieldLabel = ts.forwardRefWithAs(function FieldLabel({
  children,
  elementType: ElementType = 'label',
  isRequired,
  supplementRequiredState,
  ...labelProps
}, forwardedRef) {
  const styleProps = typography.useTextStyles({
    color: 'neutral',
    size: 'regular',
    trim: true,
    weight: 'medium',
    UNSAFE_className: style.css({
      cursor: 'default'
    })
  });
  return /*#__PURE__*/jsxRuntime.jsxs(ElementType, {
    ref: forwardedRef,
    ...labelProps,
    ...styleProps,
    children: [children, isRequired && /*#__PURE__*/jsxRuntime.jsx(Asterisk, {
      supplementRequiredState: supplementRequiredState
    })]
  });
});

/**
 * Display a required indicator for monitor users.
 *
 * In cases that don't include a semantic element for user input, describe the
 * required state for users of assistive technology.
 */
// NOTE: ideally this would be handled with the `aria-required` attribute, but
// that's not appropriate on buttons:
// > The attribute "aria-required" is not supported by the role button.
//
// It could go on the listbox, but the current implementation doesn't render the
// listbox until the dialog is open...
function Asterisk({
  supplementRequiredState
}) {
  let stringFormatter = i18n.useLocalizedStringFormatter(localizedMessages);
  return /*#__PURE__*/jsxRuntime.jsx("span", {
    "aria-label": supplementRequiredState ? stringFormatter.format('(required)') : undefined,
    children: /*#__PURE__*/jsxRuntime.jsx("span", {
      "aria-hidden": true,
      className: style.css({
        color: style.tokenSchema.color.foreground.critical,
        fontSize: style.tokenSchema.typography.text.large.size,
        lineHeight: 1,
        paddingInlineStart: '0.125em'
      }),
      children: "*"
    })
  });
}

const FieldMessage = props => {
  return /*#__PURE__*/jsxRuntime.jsxs(layout.Flex, {
    gap: "regular",
    UNSAFE_className: style.css({
      marginTop: 'calc(var(--icon-offset) * -1)'
    }),
    UNSAFE_style: {
      // @ts-ignore
      '--icon-offset': `calc(${style.tokenSchema.size.icon.regular} - ${style.tokenSchema.typography.text.small.size})`
    },
    children: [/*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
      src: alertTriangleIcon.alertTriangleIcon,
      color: "critical"
    }), /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      color: "critical",
      size: "small",
      UNSAFE_className: style.css({
        paddingTop: 'var(--icon-offset)'
      }),
      ...props
    })]
  });
};

const FieldPrimitive = /*#__PURE__*/React.forwardRef(function FieldPrimitive(props, forwardedRef) {
  const {
    children,
    contextualHelp,
    isRequired,
    label,
    labelElementType,
    labelProps,
    description,
    descriptionProps,
    errorMessage,
    errorMessageProps,
    supplementRequiredState
  } = props;
  const styleProps = style.useStyleProps(props);
  const contextualHelpId = React.useId();
  const contextualHelpSlots = React.useMemo(() => {
    return {
      // match capsize styles from the label text. stops the contextual help button
      // from pushing elements above/below it
      button: {
        UNSAFE_className: style.css({
          marginBottom: style.tokenSchema.typography.text.regular.capheightTrim,
          marginTop: style.tokenSchema.typography.text.regular.baselineTrim
        }),
        id: contextualHelpId,
        'aria-labelledby': labelProps !== null && labelProps !== void 0 && labelProps.id ? `${labelProps.id} ${contextualHelpId}` : undefined
      }
    };
  }, [contextualHelpId, labelProps === null || labelProps === void 0 ? void 0 : labelProps.id]);
  return /*#__PURE__*/jsxRuntime.jsxs(layout.Flex, {
    ref: forwardedRef,
    direction: "column",
    gap: "medium",
    minWidth: 0,
    UNSAFE_className: styleProps.className,
    UNSAFE_style: styleProps.style,
    children: [(() => {
      if (!label) {
        return null;
      }
      const labelUI = /*#__PURE__*/jsxRuntime.jsx(FieldLabel, {
        elementType: labelElementType,
        isRequired: isRequired,
        supplementRequiredState: supplementRequiredState,
        ...labelProps,
        children: label
      });
      if (contextualHelp) {
        return /*#__PURE__*/jsxRuntime.jsxs(layout.Flex, {
          gap: "small",
          alignItems: "center",
          children: [labelUI, /*#__PURE__*/jsxRuntime.jsx(index.SlotProvider, {
            slots: contextualHelpSlots,
            children: contextualHelp
          })]
        });
      }
      return labelUI;
    })(), description && /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      ...descriptionProps,
      size: "small",
      color: "neutralSecondary",
      children: description
    }), children, errorMessage && /*#__PURE__*/jsxRuntime.jsx(FieldMessage, {
      ...errorMessageProps,
      children: errorMessage
    })]
  });
});

/**
 * Provides the accessibility implementation for input fields. Fields accept
 * user input, gain context from their label, and may display a description or
 * error message.
 */
const Field = props => {
  const {
    children,
    description,
    errorMessage,
    isDisabled,
    isReadOnly,
    isRequired,
    label: label$1,
    ...otherProps
  } = props;
  let {
    labelProps,
    fieldProps,
    descriptionProps,
    errorMessageProps
  } = label.useField(props);
  const renderProps = {
    ...fieldProps,
    disabled: isDisabled,
    readOnly: isReadOnly,
    'aria-required': isRequired || undefined,
    'aria-invalid': errorMessage ? true : undefined
  };
  return /*#__PURE__*/jsxRuntime.jsx(FieldPrimitive, {
    isRequired: isRequired,
    label: label$1,
    labelProps: labelProps,
    description: description,
    descriptionProps: descriptionProps,
    errorMessage: errorMessage,
    errorMessageProps: errorMessageProps,
    ...otherProps,
    children: children(renderProps)
  });
};

/**
 * Add `validationState` when `errorMessage` is provided. Used by
 * "@react-aria/*" hooks to determine aria attributes.
 */
function validateFieldProps(props) {
  if (props.errorMessage) {
    return Object.assign({}, {
      validationState: 'invalid'
    }, props);
  }
  return props;
}

exports.Field = Field;
exports.FieldLabel = FieldLabel;
exports.FieldMessage = FieldMessage;
exports.FieldPrimitive = FieldPrimitive;
exports.validateFieldProps = validateFieldProps;
