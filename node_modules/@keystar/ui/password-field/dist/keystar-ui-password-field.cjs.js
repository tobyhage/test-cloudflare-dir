'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var React = require('react');
var button = require('@keystar/ui/button');
var icon = require('@keystar/ui/icon');
var eyeIcon = require('@keystar/ui/icon/icons/eyeIcon');
var eyeOffIcon = require('@keystar/ui/icon/icons/eyeOffIcon');
var style = require('@keystar/ui/style');
var textField = require('@keystar/ui/text-field');
var i18n = require('@react-aria/i18n');
var textfield = require('@react-aria/textfield');
var utils$1 = require('@react-stately/utils');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

var localizedMessages = {
	"ar-AE": {
		show: "أقل {fieldLabel}"
	},
	"bg-BG": {
		show: "Показване {fieldLabel}"
	},
	"cs-CZ": {
		show: "Zobrazit {fieldLabel}"
	},
	"da-DK": {
		show: "Vis {fieldLabel}"
	},
	"de-DE": {
		show: "{fieldLabel} anzeigen"
	},
	"el-GR": {
		show: "Εμφάνιση {fieldLabel}"
	},
	"en-US": {
		show: "Show {fieldLabel}"
	},
	"es-ES": {
		show: "Mostrar {fieldLabel}"
	},
	"et-EE": {
		show: "Kuva {fieldLabel}"
	},
	"fi-FI": {
		show: "Näytä {fieldLabel}"
	},
	"fr-FR": {
		show: "Afficher {fieldLabel}"
	},
	"he-IL": {
		show: "{fieldLabel} הצג"
	},
	"hr-HR": {
		show: "Prikaži {fieldLabel}"
	},
	"hu-HU": {
		show: "Mutass {fieldLabel}"
	},
	"it-IT": {
		show: "Mostra {fieldLabel}"
	},
	"ja-JP": {
		show: "{fieldLabel}を表示"
	},
	"ko-KR": {
		show: "{fieldLabel} 표시"
	},
	"lt-LT": {
		show: "Rodyti {fieldLabel}"
	},
	"lv-LV": {
		show: "Rādīt {fieldLabel}"
	},
	"nb-NO": {
		show: "Vis {fieldLabel}"
	},
	"nl-NL": {
		show: "Toon {fieldLabel}"
	},
	"pl-PL": {
		show: "Pokaż {fieldLabel}"
	},
	"pt-BR": {
		show: "Mostrar {fieldLabel}"
	},
	"pt-PT": {
		show: "Mostrar {fieldLabel}"
	},
	"ro-RO": {
		show: "Se afișează {fieldLabel}"
	},
	"ru-RU": {
		show: "Показать {fieldLabel}"
	},
	"sk-SK": {
		show: "Zobraziť {fieldLabel}"
	},
	"sl-SI": {
		show: "Prikaži {fieldLabel}"
	},
	"sr-SP": {
		show: "Prikaži {fieldLabel}"
	},
	"sv-SE": {
		show: "Visa {fieldLabel}"
	},
	"tr-TR": {
		show: "{fieldLabel} göster"
	},
	"uk-UA": {
		show: "Показувати {fieldLabel}"
	},
	"zh-CN": {
		show: "显示{fieldLabel}"
	},
	"zh-TW": {
		show: "顯示{fieldLabel}"
	}
};

/**
 * Provides the behavior and accessibility implementation for a password field.
 * @param props - Props for the password field.
 * @param state - State for the password field, as returned by `usePasswordFieldState`.
 * @param inputRef - A ref to the input element.
 */
function usePasswordField(props, state, inputRef) {
  let {
    autoComplete = 'current-password',
    isDisabled
  } = props;
  let type = state.secureTextEntry ? 'password' : 'text';
  let {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps
  } = textfield.useTextField({
    ...props,
    value: state.value,
    onChange: state.setValue,
    type,
    autoComplete
  }, inputRef);

  // Determine the label for the increment and decrement buttons. There are 4 cases:
  //
  // 1. With a visible label that is a string: aria-label: `Increase ${props.label}`
  // 2. With a visible label that is JSX: aria-label: 'Increase', aria-labelledby: '${revealButtonId} ${labelId}'
  // 3. With an aria-label: aria-label: `Increase ${props['aria-label']}`
  // 4. With an aria-labelledby: aria-label: 'Increase', aria-labelledby: `${revealButtonId} ${props['aria-labelledby']}`
  //
  // (1) and (2) could possibly be combined and both use aria-labelledby. However, placing the label in
  // the aria-label string rather than using aria-labelledby gives more flexibility to translators to change
  // the order or add additional words around the label if needed.
  let fieldLabel = props['aria-label'] || (typeof props.label === 'string' ? props.label : '');
  let ariaLabelledby;
  if (!fieldLabel) {
    ariaLabelledby = props.label != null ? labelProps.id : props['aria-labelledby'];
  }

  // NOTE: would prefer `useLocalizedStringFormatter` from
  // @react-aria/i18n, but it is not working with variables
  let formatMessage = i18n.useMessageFormatter(localizedMessages);
  let revealButtonId = utils.useId();
  let revealButtonProps = {
    'aria-label': formatMessage('show', {
      fieldLabel
    }).trim(),
    id: ariaLabelledby ? revealButtonId : undefined,
    'aria-labelledby': ariaLabelledby ? `${revealButtonId} ${ariaLabelledby}` : undefined,
    'aria-pressed': !state.secureTextEntry,
    isDisabled,
    onPress: state.toggleSecureTextEntry
  };
  return {
    labelProps,
    inputProps,
    revealButtonProps,
    errorMessageProps,
    descriptionProps
  };
}

/**
 * Provides state management for a password field.
 */
function usePasswordFieldState(props) {
  let [value, setValue] = utils$1.useControlledState(toString(props.value), toString(props.defaultValue) || '', props.onChange);
  const [secureTextEntry, setSecureTextEntry] = React__default["default"].useState(true);
  const toggleSecureTextEntry = React__default["default"].useCallback(() => {
    setSecureTextEntry(isSecure => !isSecure);
  }, []);
  return {
    value,
    setValue,
    secureTextEntry,
    setSecureTextEntry,
    toggleSecureTextEntry
  };
}
function toString(val) {
  if (val == null) {
    return;
  }
  return val.toString();
}

const classList = new style.ClassList('PasswordField', ['input']);

/**
 * Password fields are text fields for entering secure text.
 */
const PasswordField = /*#__PURE__*/React.forwardRef(function PasswordField(props, forwardedRef) {
  props = textField.validateTextFieldProps(props);
  let {
    description,
    allowTextReveal = true,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    ...styleProps
  } = props;
  let inputRef = utils.useObjectRef(forwardedRef);
  let state = usePasswordFieldState(props);
  let {
    labelProps,
    inputProps,
    revealButtonProps,
    descriptionProps,
    errorMessageProps
  } = usePasswordField(props, state, inputRef);
  return /*#__PURE__*/jsxRuntime.jsx(textField.TextFieldPrimitive, {
    ...styleProps,
    label: label,
    description: description,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps,
    labelProps: labelProps,
    ref: inputRef,
    inputProps: {
      ...inputProps,
      className: classList.element('input')
    },
    isDisabled: isDisabled,
    isReadOnly: isReadOnly,
    isRequired: isRequired,
    endElement: allowTextReveal && /*#__PURE__*/jsxRuntime.jsx(RevealButton, {
      isDisabled: isDisabled,
      secureTextEntry: state.secureTextEntry,
      ...revealButtonProps
    })
  });
});

/**
 * @private the reveal button is used to show and hide input text.
 */
function RevealButton(props) {
  let {
    secureTextEntry,
    ...otherProps
  } = props;
  return /*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
    ...otherProps,
    UNSAFE_className: style.css({
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      [`${classList.selector('input')}[aria-invalid] ~ &`]: {
        borderColor: style.tokenSchema.color.alias.borderInvalid
      },
      [`${classList.selector('input')}[readonly] ~ &`]: {
        borderColor: style.tokenSchema.color.alias.borderIdle
      },
      [`${classList.selector('input')}:focus ~ &`]: {
        borderColor: style.tokenSchema.color.alias.borderFocused
      }
    }),
    children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
      src: secureTextEntry ? eyeIcon.eyeIcon : eyeOffIcon.eyeOffIcon
    })
  });
}

exports.PasswordField = PasswordField;
