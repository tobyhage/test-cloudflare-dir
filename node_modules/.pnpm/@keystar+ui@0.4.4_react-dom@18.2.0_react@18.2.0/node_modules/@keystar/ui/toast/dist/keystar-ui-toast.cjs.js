'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var toast$1 = require('@react-stately/toast');
var React = require('react');
var emery = require('emery');
var i18n = require('@react-aria/i18n');
var toast = require('@react-aria/toast');
var utils = require('@react-aria/utils');
var button = require('@keystar/ui/button');
var icon = require('@keystar/ui/icon');
var checkCircle2Icon = require('@keystar/ui/icon/icons/checkCircle2Icon');
var infoIcon = require('@keystar/ui/icon/icons/infoIcon');
var alertTriangleIcon = require('@keystar/ui/icon/icons/alertTriangleIcon');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils$1 = require('@keystar/ui/utils');
var slots = require('@keystar/ui/slots');
var jsxRuntime = require('react/jsx-runtime');
var ReactDOM = require('react-dom');
var core = require('@keystar/ui/core');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var ReactDOM__default = /*#__PURE__*/_interopDefault(ReactDOM);

var intlMessages = {
	"ar-AE": {
		info: "معلومات",
		critical: "خطأ",
		positive: "تم بنجاح"
	},
	"bg-BG": {
		info: "Инфо",
		critical: "Грешка",
		positive: "Успех"
	},
	"cs-CZ": {
		info: "Informace",
		critical: "Chyba",
		positive: "Úspěch"
	},
	"da-DK": {
		info: "Info",
		critical: "Fejl",
		positive: "Fuldført"
	},
	"de-DE": {
		info: "Informationen",
		critical: "Fehler",
		positive: "Erfolg"
	},
	"el-GR": {
		info: "Πληροφορίες",
		critical: "Σφάλμα",
		positive: "Επιτυχία"
	},
	"en-US": {
		info: "Info",
		critical: "Error",
		positive: "Success"
	},
	"es-ES": {
		info: "Información",
		critical: "Error",
		positive: "Éxito"
	},
	"et-EE": {
		info: "Teave",
		critical: "Viga",
		positive: "Valmis"
	},
	"fi-FI": {
		info: "Tiedot",
		critical: "Virhe",
		positive: "Onnistui"
	},
	"fr-FR": {
		info: "Infos",
		critical: "Erreur",
		positive: "Succès"
	},
	"he-IL": {
		info: "מידע",
		critical: "שגיאה",
		positive: "הצלחה"
	},
	"hr-HR": {
		info: "Informacije",
		critical: "Pogreška",
		positive: "Uspješno"
	},
	"hu-HU": {
		info: "Információ",
		critical: "Hiba",
		positive: "Siker"
	},
	"it-IT": {
		info: "Informazioni",
		critical: "Errore",
		positive: "Operazione riuscita"
	},
	"ja-JP": {
		info: "情報",
		critical: "エラー",
		positive: "成功"
	},
	"ko-KR": {
		info: "정보",
		critical: "오류",
		positive: "성공"
	},
	"lt-LT": {
		info: "Informacija",
		critical: "Klaida",
		positive: "Sėkmingai"
	},
	"lv-LV": {
		info: "Informācija",
		critical: "Kļūda",
		positive: "Izdevās"
	},
	"nb-NO": {
		info: "Info",
		critical: "Feil",
		positive: "Vellykket"
	},
	"nl-NL": {
		info: "Info",
		critical: "Fout",
		positive: "Geslaagd"
	},
	"pl-PL": {
		info: "Informacje",
		critical: "Błąd",
		positive: "Powodzenie"
	},
	"pt-BR": {
		info: "Informações",
		critical: "Erro",
		positive: "Sucesso"
	},
	"pt-PT": {
		info: "Informação",
		critical: "Erro",
		positive: "Sucesso"
	},
	"ro-RO": {
		info: "Informaţii",
		critical: "Eroare",
		positive: "Succes"
	},
	"ru-RU": {
		info: "Информация",
		critical: "Ошибка",
		positive: "Успешно"
	},
	"sk-SK": {
		info: "Informácie",
		critical: "Chyba",
		positive: "Úspech"
	},
	"sl-SI": {
		info: "Informacije",
		critical: "Napaka",
		positive: "Uspešno"
	},
	"sr-SP": {
		info: "Informacije",
		critical: "Greška",
		positive: "Uspešno"
	},
	"sv-SE": {
		info: "Info",
		critical: "Fel",
		positive: "Lyckades"
	},
	"tr-TR": {
		info: "Bilgiler",
		critical: "Hata",
		positive: "Başarılı"
	},
	"uk-UA": {
		info: "Інформація",
		critical: "Помилка",
		positive: "Успішно"
	},
	"zh-CN": {
		info: "信息",
		critical: "错误",
		positive: "成功"
	},
	"zh-TW": {
		info: "資訊",
		critical: "錯誤",
		positive: "成功"
	}
};

const ICONS = {
  info: infoIcon.infoIcon,
  critical: alertTriangleIcon.alertTriangleIcon,
  // neutral: infoIcon,
  positive: checkCircle2Icon.checkCircle2Icon
};
function Toast(props, ref) {
  let {
    toast: {
      key,
      animation,
      content: {
        children,
        tone,
        actionLabel,
        onAction,
        shouldCloseOnAction
      }
    },
    state,
    ...otherProps
  } = props;
  let domRef = utils.useObjectRef(ref);
  let {
    closeButtonProps,
    titleProps,
    toastProps
  } = toast.useToast(props, state, domRef);
  let styleProps = style.useStyleProps(otherProps);
  let stringFormatter = i18n.useLocalizedStringFormatter(intlMessages);
  let iconLabel = tone && tone !== 'neutral' ? stringFormatter.format(tone) : null;
  let icon$1 = tone && tone !== 'neutral' ? ICONS[tone] : null;
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    if (shouldCloseOnAction) {
      state.close(key);
    }
  };
  let slots$1 = React.useMemo(() => ({
    text: {
      color: 'inherit'
    }
  }), []);
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    ...styleProps,
    ...toastProps,
    ref: domRef,
    "data-tone": tone,
    className: style.classNames(style.css({
      borderRadius: style.tokenSchema.size.radius.regular,
      display: 'flex',
      margin: style.tokenSchema.size.space.large,
      maxWidth: style.tokenSchema.size.container.xsmall,
      minHeight: style.tokenSchema.size.element.large,
      padding: style.tokenSchema.size.space.regular,
      paddingInlineStart: style.tokenSchema.size.space.large,
      pointerEvents: 'auto',
      position: 'absolute',
      // tones
      color: style.tokenSchema.color.foreground.onEmphasis,
      '&[data-tone=neutral]': {
        background: style.tokenSchema.color.scale['slate9']
      },
      '&[data-tone=info]': {
        background: style.tokenSchema.color.background.accentEmphasis
      },
      '&[data-tone=positive]': {
        background: style.tokenSchema.color.background.positiveEmphasis
      },
      '&[data-tone=critical]': {
        background: style.tokenSchema.color.background.criticalEmphasis
      },
      // animations
      '&[data-animation=entering]': {
        animation: `${slideInAnim} 300ms`
      },
      '&[data-animation=exiting]': {
        animation: `${fadeOutAnim} 300ms forwards`
      }
    }), styleProps.className),
    style: {
      ...styleProps.style,
      zIndex: props.toast.priority
    },
    "data-animation": animation,
    onAnimationEnd: () => {
      if (animation === 'exiting') {
        state.remove(key);
      }
    },
    children: /*#__PURE__*/jsxRuntime.jsxs(slots.SlotProvider, {
      slots: slots$1,
      children: [icon$1 && /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
        "aria-label": iconLabel,
        src: icon$1,
        size: "medium",
        marginTop: "small",
        marginEnd: "regular"
      }), /*#__PURE__*/jsxRuntime.jsxs("div", {
        className: style.classNames(style.css({
          alignItems: 'center',
          display: 'flex',
          columnGap: style.tokenSchema.size.space.large,
          flex: 1,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          paddingInlineEnd: style.tokenSchema.size.space.large
        })),
        children: [/*#__PURE__*/jsxRuntime.jsx("div", {
          className: style.classNames(style.css({
            flexGrow: 1,
            paddingBlock: style.tokenSchema.size.space.regular
          })),
          ...titleProps,
          children: utils$1.isReactText(children) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
            children: children
          }) : children
        }), actionLabel && /*#__PURE__*/jsxRuntime.jsx(button.Button, {
          onPress: handleAction
          // prominence="low"
          ,
          static: "light"
          // tone="secondary"
          // staticColor="white"
          ,
          children: actionLabel
        })]
      }), /*#__PURE__*/jsxRuntime.jsx("div", {
        className: style.css({
          borderInlineStart: `${style.tokenSchema.size.border.regular} solid #fff3`,
          paddingInlineStart: style.tokenSchema.size.space.regular
        }),
        children: /*#__PURE__*/jsxRuntime.jsx(button.ClearButton, {
          static: "light",
          ...closeButtonProps
        })
      })]
    })
  });
}
let slideInAnim = style.keyframes({
  from: {
    transform: `var(--slide-from)`
  },
  to: {
    transform: `var(--slide-to)`
  }
});
let fadeOutAnim = style.keyframes({
  from: {
    opacity: 1
  },
  to: {
    opacity: 0
  }
});
let _Toast = /*#__PURE__*/React.forwardRef(Toast);

/** @private Positioning and provider for toast children. */
function ToastContainer(props) {
  let {
    children,
    state
  } = props;
  let {
    direction
  } = i18n.useLocale();
  let isMobileDevice = style.useIsMobileDevice();
  let placement = isMobileDevice ? 'center' : props.placement || 'end';
  let position = isMobileDevice ? 'bottom' : props.position || 'bottom';
  let ref = React.useRef(null);
  let {
    regionProps
  } = toast.useToastRegion(props, state, ref);
  let contents = /*#__PURE__*/jsxRuntime.jsx(core.KeystarProvider, {
    UNSAFE_style: {
      background: 'transparent'
    },
    children: /*#__PURE__*/jsxRuntime.jsx(style.FocusRing, {
      children: /*#__PURE__*/jsxRuntime.jsx("div", {
        ...regionProps,
        ref: ref
        // TODO: replace with CSS `dir(rtl)` when supported: https://caniuse.com/css-dir-pseudo
        ,
        "data-direction": direction,
        "data-position": position,
        "data-placement": placement,
        className: style.css({
          display: 'flex',
          insetInline: 0,
          outline: 'none',
          pointerEvents: 'none',
          position: 'fixed',
          zIndex: 100 /* above modals */,

          '&[data-focus=visible] > :first-child:after': {
            borderRadius: `calc(${style.tokenSchema.size.radius.regular} + ${style.tokenSchema.size.alias.focusRingGap})`,
            boxShadow: `0 0 0 ${style.tokenSchema.size.alias.focusRing} ${style.tokenSchema.color.alias.focusRing}`,
            content: '""',
            inset: 0,
            margin: `calc(-1 * ${style.tokenSchema.size.alias.focusRingGap})`,
            pointerEvents: 'none',
            position: 'absolute'
          },
          '&[data-position=top]': {
            top: 0,
            flexDirection: 'column',
            '--slide-from': 'translateY(-100%)',
            '--slide-to': 'translateY(0)'
          },
          '&[data-position=bottom]': {
            bottom: 0,
            flexDirection: 'column-reverse',
            '--slide-from': 'translateY(100%)',
            '--slide-to': 'translateY(0)'
          },
          '&[data-placement=start]': {
            alignItems: 'flex-start',
            '--slide-from': 'translateX(-100%)',
            '--slide-to': 'translateX(0)',
            '&[data-direction=rtl]': {
              '--slide-from': 'translateX(100%)'
            }
          },
          '&[data-placement=center]': {
            alignItems: 'center'
          },
          '&[data-placement=end]': {
            alignItems: 'flex-end',
            '--slide-from': 'translateX(100%)',
            '--slide-to': 'translateX(0)',
            '&[data-direction=rtl]': {
              '--slide-from': 'translateX(-100%)'
            }
          }
        }),
        children: children
      })
    })
  });
  return /*#__PURE__*/ReactDOM__default["default"].createPortal(contents, document.body);
}

// There is a single global toast queue instance for the whole app, initialized lazily.
let globalToastQueue = null;
function getGlobalToastQueue() {
  if (!globalToastQueue) {
    globalToastQueue = new toast$1.ToastQueue({
      maxVisibleToasts: 1,
      hasExitAnimation: true
    });
  }
  return globalToastQueue;
}
let toastProviders = new Set();
let subscriptions = new Set();
function subscribe(fn) {
  subscriptions.add(fn);
  return () => subscriptions.delete(fn);
}
function getActiveToaster() {
  return toastProviders.values().next().value;
}
function useActiveToaster() {
  return React.useSyncExternalStore(subscribe, getActiveToaster, getActiveToaster);
}

/**
 * A Toaster renders the queued toasts in an application. It should be
 * placed at the root of the app.
 */
function Toaster(props) {
  // Track all toast provider instances in a set.
  // Only the first one will actually render.
  // We use a ref to do this, since it will have a stable identity
  // over the lifetime of the component.
  let ref = React.useRef();
  toastProviders.add(ref);

  // eslint-disable-next-line arrow-body-style
  React.useEffect(() => {
    return () => {
      // When this toast provider unmounts, reset all animations so that
      // when the new toast provider renders, it is seamless.
      for (let toast of getGlobalToastQueue().visibleToasts) {
        toast.animation = undefined;
      }

      // Remove this toast provider, and call subscriptions.
      // This will cause all other instances to re-render,
      // and the first one to become the new active toast provider.
      toastProviders.delete(ref);
      for (let fn of subscriptions) {
        fn();
      }
    };
  }, []);

  // Only render if this is the active toast provider instance, and there are visible toasts.
  let activeToaster = useActiveToaster();
  let state = toast$1.useToastQueue(getGlobalToastQueue());
  if (ref === activeToaster && state.visibleToasts.length > 0) {
    return /*#__PURE__*/jsxRuntime.jsx(ToastContainer, {
      state: state,
      ...props,
      children: state.visibleToasts.map(toast => /*#__PURE__*/jsxRuntime.jsx(_Toast, {
        toast: toast,
        state: state
      }, toast.key))
    });
  }
  return null;
}
function addToast(children, tone, options = {}) {
  // Dispatch a custom event so that toasts can be intercepted and re-targeted, e.g. when inside an iframe.
  if (typeof CustomEvent !== 'undefined' && typeof window !== 'undefined') {
    let event = new CustomEvent('keystar-ui-toast', {
      cancelable: true,
      bubbles: true,
      detail: {
        children,
        tone,
        options
      }
    });
    let shouldContinue = window.dispatchEvent(event);
    if (!shouldContinue) {
      return () => {};
    }
  }
  let value = {
    children,
    tone,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
    shouldCloseOnAction: options.shouldCloseOnAction
  };

  // Actionable toasts cannot be auto dismissed.
  emery.warning(!(options.timeout && options.onAction), 'Timeouts are not supported on actionable toasts.');
  emery.warning(!!(options.timeout && options.timeout >= 5000), 'Timeouts must be at least 5000ms, for accessibility.');
  let timeout = options.timeout && !options.onAction ? Math.max(options.timeout, 5000) : undefined;
  let queue = getGlobalToastQueue();
  let key = queue.add(value, {
    priority: getPriority(tone, options),
    timeout,
    onClose: options.onClose
  });
  return () => queue.close(key);
}
const toastQueue = {
  /** Queues a neutral toast. */
  neutral(children, options = {}) {
    return addToast(children, 'neutral', options);
  },
  /** Queues a positive toast. */
  positive(children, options = {}) {
    return addToast(children, 'positive', options);
  },
  /** Queues a critical toast. */
  critical(children, options = {}) {
    return addToast(children, 'critical', options);
  },
  /** Queues an informational toast. */
  info(children, options = {}) {
    return addToast(children, 'info', options);
  }
};

// TODO: if a lower priority toast comes in, no way to know until you dismiss
// the higher priority one.
const PRIORITY = {
  // actionable toasts gain 4 priority points. make sure critical toasts are
  // always at the top.
  critical: 10,
  positive: 3,
  info: 2,
  neutral: 1
};
function getPriority(tone, options) {
  let priority = PRIORITY[tone] || 1;
  if (options.onAction) {
    priority += 4;
  }
  return priority;
}

exports.Toaster = Toaster;
exports.toastQueue = toastQueue;
