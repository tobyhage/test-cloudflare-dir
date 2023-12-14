'use client';
import { useId, useObjectRef } from '@react-aria/utils';
import React, { forwardRef } from 'react';
import { ActionButton } from '@keystar/ui/button';
import { Icon } from '@keystar/ui/icon';
import { eyeIcon } from '@keystar/ui/icon/icons/eyeIcon';
import { eyeOffIcon } from '@keystar/ui/icon/icons/eyeOffIcon';
import { ClassList, css, tokenSchema } from '@keystar/ui/style';
import { validateTextFieldProps, TextFieldPrimitive } from '@keystar/ui/text-field';
import { useMessageFormatter } from '@react-aria/i18n';
import { useTextField } from '@react-aria/textfield';
import { useControlledState } from '@react-stately/utils';
import { jsx } from 'react/jsx-runtime';

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
  } = useTextField({
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
  let formatMessage = useMessageFormatter(localizedMessages);
  let revealButtonId = useId();
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
  let [value, setValue] = useControlledState(toString(props.value), toString(props.defaultValue) || '', props.onChange);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const toggleSecureTextEntry = React.useCallback(() => {
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

const classList = new ClassList('PasswordField', ['input']);

/**
 * Password fields are text fields for entering secure text.
 */
const PasswordField = /*#__PURE__*/forwardRef(function PasswordField(props, forwardedRef) {
  props = validateTextFieldProps(props);
  let {
    description,
    allowTextReveal = true,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    ...styleProps
  } = props;
  let inputRef = useObjectRef(forwardedRef);
  let state = usePasswordFieldState(props);
  let {
    labelProps,
    inputProps,
    revealButtonProps,
    descriptionProps,
    errorMessageProps
  } = usePasswordField(props, state, inputRef);
  return /*#__PURE__*/jsx(TextFieldPrimitive, {
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
    endElement: allowTextReveal && /*#__PURE__*/jsx(RevealButton, {
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
  return /*#__PURE__*/jsx(ActionButton, {
    ...otherProps,
    UNSAFE_className: css({
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      [`${classList.selector('input')}[aria-invalid] ~ &`]: {
        borderColor: tokenSchema.color.alias.borderInvalid
      },
      [`${classList.selector('input')}[readonly] ~ &`]: {
        borderColor: tokenSchema.color.alias.borderIdle
      },
      [`${classList.selector('input')}:focus ~ &`]: {
        borderColor: tokenSchema.color.alias.borderFocused
      }
    }),
    children: /*#__PURE__*/jsx(Icon, {
      src: secureTextEntry ? eyeIcon : eyeOffIcon
    })
  });
}

export { PasswordField };
