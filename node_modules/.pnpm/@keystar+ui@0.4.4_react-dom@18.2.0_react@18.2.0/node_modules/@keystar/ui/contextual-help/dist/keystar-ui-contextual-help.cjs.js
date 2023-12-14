'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var i18n = require('@react-aria/i18n');
var utils = require('@react-aria/utils');
var React = require('react');
var button = require('@keystar/ui/button');
var dialog = require('@keystar/ui/dialog');
var icon = require('@keystar/ui/icon');
var helpCircleIcon = require('@keystar/ui/icon/icons/helpCircleIcon');
var infoIcon = require('@keystar/ui/icon/icons/infoIcon');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var jsxRuntime = require('react/jsx-runtime');

var localizedMessages = {
	"ar-AE": {
		help: "مساعدة",
		info: "معلومات"
	},
	"bg-BG": {
		help: "Помощ",
		info: "Информация"
	},
	"cs-CZ": {
		help: "Nápověda",
		info: "Informace"
	},
	"da-DK": {
		help: "Hjælp",
		info: "Oplysninger"
	},
	"de-DE": {
		help: "Hilfe",
		info: "Informationen"
	},
	"el-GR": {
		help: "Βοήθεια",
		info: "Πληροφορίες"
	},
	"en-US": {
		info: "Information",
		help: "Help"
	},
	"es-ES": {
		help: "Ayuda",
		info: "Información"
	},
	"et-EE": {
		help: "Spikker",
		info: "Teave"
	},
	"fi-FI": {
		help: "Ohje",
		info: "Tiedot"
	},
	"fr-FR": {
		help: "Aide",
		info: "Informations"
	},
	"he-IL": {
		help: "עזרה",
		info: "מידע"
	},
	"hr-HR": {
		help: "Pomoć",
		info: "Informacije"
	},
	"hu-HU": {
		help: "Súgó",
		info: "Információ"
	},
	"it-IT": {
		help: "Aiuto",
		info: "Informazioni"
	},
	"ja-JP": {
		help: "ヘルプ",
		info: "情報"
	},
	"ko-KR": {
		help: "도움말",
		info: "정보"
	},
	"lt-LT": {
		help: "Žinynas",
		info: "Informacija"
	},
	"lv-LV": {
		help: "Palīdzība",
		info: "Informācija"
	},
	"nb-NO": {
		help: "Hjelp",
		info: "Informasjon"
	},
	"nl-NL": {
		help: "Help",
		info: "Informatie"
	},
	"pl-PL": {
		help: "Pomoc",
		info: "Informacja"
	},
	"pt-BR": {
		help: "Ajuda",
		info: "Informações"
	},
	"pt-PT": {
		help: "Ajuda",
		info: "Informação"
	},
	"ro-RO": {
		help: "Ajutor",
		info: "Informaţii"
	},
	"ru-RU": {
		help: "Справка",
		info: "Информация"
	},
	"sk-SK": {
		help: "Pomoc",
		info: "Informácie"
	},
	"sl-SI": {
		help: "Pomoč",
		info: "Informacije"
	},
	"sr-SP": {
		help: "Pomoć",
		info: "Informacije"
	},
	"sv-SE": {
		help: "Hjälp",
		info: "Information"
	},
	"tr-TR": {
		help: "Yardım",
		info: "Bilgiler"
	},
	"uk-UA": {
		help: "Довідка",
		info: "Інформація"
	},
	"zh-CN": {
		help: "帮助",
		info: "信息"
	},
	"zh-TW": {
		help: "說明",
		info: "資訊"
	}
};

/** Contextual help shows a user extra information about an adjacent component. */
const ContextualHelp = /*#__PURE__*/React.forwardRef(function ContextualHelp(props, ref) {
  let {
    children,
    variant = 'help',
    ...otherProps
  } = props;
  let stringFormatter = i18n.useLocalizedStringFormatter(localizedMessages);
  let labelProps = utils.useLabels(otherProps, stringFormatter.format(variant));
  let icon$1 = variant === 'info' ? infoIcon.infoIcon : helpCircleIcon.helpCircleIcon;
  return /*#__PURE__*/jsxRuntime.jsxs(dialog.DialogTrigger, {
    ...otherProps,
    type: "popover",
    children: [/*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
      ...utils.mergeProps(otherProps, labelProps, {
        isDisabled: false
      }),
      ref: ref,
      UNSAFE_className: style.classNames(style.css({
        borderRadius: style.tokenSchema.size.radius.small,
        height: style.tokenSchema.size.element.small,
        minWidth: 'unset',
        paddingInline: 0,
        width: style.tokenSchema.size.element.small
      }), otherProps.UNSAFE_className),
      prominence: "low",
      children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
        src: icon$1
      })
    }), /*#__PURE__*/jsxRuntime.jsx(slots.ClearSlots, {
      children: /*#__PURE__*/jsxRuntime.jsx(dialog.Dialog, {
        children: children
      })
    })]
  });
});

exports.ContextualHelp = ContextualHelp;
