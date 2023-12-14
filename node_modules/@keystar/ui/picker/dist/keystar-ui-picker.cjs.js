'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var collections = require('@react-stately/collections');
var interactions = require('@react-aria/interactions');
var i18n = require('@react-aria/i18n');
var select$1 = require('@react-aria/select');
var utils = require('@react-aria/utils');
var select = require('@react-stately/select');
var React = require('react');
var button = require('@keystar/ui/button');
var core = require('@keystar/ui/core');
var field = require('@keystar/ui/field');
var chevronsUpDownIcon = require('@keystar/ui/icon/icons/chevronsUpDownIcon');
var icon = require('@keystar/ui/icon');
var listbox = require('@keystar/ui/listbox');
var overlays = require('@keystar/ui/overlays');
var progress = require('@keystar/ui/progress');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils$1 = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');

var localizedMessages = {
	"ar-AE": {
		loading: "جارٍ التحميل...",
		placeholder: "حدد خيارًا..."
	},
	"bg-BG": {
		loading: "Зареждане...",
		placeholder: "Изберете опция"
	},
	"cs-CZ": {
		loading: "Načítání...",
		placeholder: "Vyberte vhodnou možnost..."
	},
	"da-DK": {
		loading: "Indlæser ...",
		placeholder: "Vælg en mulighed ..."
	},
	"de-DE": {
		loading: "Laden...",
		placeholder: "Option auswählen..."
	},
	"el-GR": {
		loading: "Φόρτωση...",
		placeholder: "Επιλέξτε…"
	},
	"en-US": {
		placeholder: "Select an option…",
		loading: "Loading…"
	},
	"es-ES": {
		loading: "Cargando…",
		placeholder: "Selecciona una de estas opciones..."
	},
	"et-EE": {
		loading: "Laadimine...",
		placeholder: "Valige valikuline..."
	},
	"fi-FI": {
		loading: "Ladataan…",
		placeholder: "Valitse vaihtoehto..."
	},
	"fr-FR": {
		loading: "Chargement...",
		placeholder: "Sélectionnez une option..."
	},
	"he-IL": {
		loading: "טוען...",
		placeholder: "בחר אפשרות..."
	},
	"hr-HR": {
		loading: "Učitavam...",
		placeholder: "Odaberite opciju"
	},
	"hu-HU": {
		loading: "Betöltés folyamatban…",
		placeholder: "Válasszon egy opciót…"
	},
	"it-IT": {
		loading: "Caricamento...",
		placeholder: "Seleziona un’opzione..."
	},
	"ja-JP": {
		loading: "読み込み中...",
		placeholder: "オプションを選択..."
	},
	"ko-KR": {
		loading: "로드 중",
		placeholder: "선택 사항 선택"
	},
	"lt-LT": {
		loading: "Įkeliama...",
		placeholder: "Pasirinkite parinktį..."
	},
	"lv-LV": {
		loading: "Notiek ielāde...",
		placeholder: "Atlasiet opciju..."
	},
	"nb-NO": {
		loading: "Laster inn ...",
		placeholder: "Velg et alternativ..."
	},
	"nl-NL": {
		loading: "Laden...",
		placeholder: "Optie selecteren..."
	},
	"pl-PL": {
		loading: "Ładowanie...",
		placeholder: "Wybierz opcję..."
	},
	"pt-BR": {
		loading: "Carregando...",
		placeholder: "Selecione uma opção..."
	},
	"pt-PT": {
		loading: "A carregar...",
		placeholder: "Selecionar uma opção..."
	},
	"ro-RO": {
		loading: "Se încarcă...",
		placeholder: "Selectați o opțiune"
	},
	"ru-RU": {
		loading: "Загрузка...",
		placeholder: "Выбрать параметр..."
	},
	"sk-SK": {
		loading: "Načítava sa...",
		placeholder: "Vyberte možnosť..."
	},
	"sl-SI": {
		loading: "Nalaganje...",
		placeholder: "Izberite možnost"
	},
	"sr-SP": {
		loading: "Učitavam...",
		placeholder: "Izaberite opciju"
	},
	"sv-SE": {
		loading: "Läser in...",
		placeholder: "Välj ett alternativ..."
	},
	"tr-TR": {
		loading: "Yükleniyor...",
		placeholder: "Bir seçim yapın…"
	},
	"uk-UA": {
		loading: "Завантаження…",
		placeholder: "Виберіть опцію..."
	},
	"zh-CN": {
		loading: "正在加载...",
		placeholder: "选择一个选项..."
	},
	"zh-T": {
		loading: "正在載入",
		placeholder: "選取一個選項"
	}
};

function Picker(props, forwardedRef) {
  props = slots.useSlotProps(props, 'picker');
  props = core.useProviderProps(props);
  let stringFormatter = i18n.useLocalizedStringFormatter(localizedMessages);
  let {
    align = 'start',
    autoComplete,
    autoFocus,
    direction = 'bottom',
    isDisabled,
    label,
    menuWidth,
    name,
    placeholder = stringFormatter.format('placeholder'),
    prominence,
    shouldFlip = true
  } = props;
  let popoverRef = React.useRef(null);
  let triggerRef = React.useRef(null);
  let listboxRef = React.useRef(null);

  // We create the listbox layout in Picker and pass it to ListBoxBase below
  // so that the layout information can be cached even while the listbox is not mounted.
  // We also use the layout as the keyboard delegate for type to select.
  let state = select.useSelectState(props);
  let layout = listbox.useListBoxLayout(state);
  let {
    labelProps,
    triggerProps,
    valueProps,
    menuProps,
    descriptionProps,
    errorMessageProps
  } = select$1.useSelect({
    ...props,
    keyboardDelegate: layout
  }, state, triggerRef);
  let isMobile = style.useIsMobileDevice();
  let isLoadingInitial = props.isLoading && state.collection.size === 0;
  let isLoadingMore = props.isLoading && state.collection.size > 0;

  // On small screen devices, the listbox is rendered in a tray, otherwise a popover.
  let listbox$1 = /*#__PURE__*/jsxRuntime.jsx(listbox.ListBoxBase, {
    ...menuProps,
    ref: listboxRef,
    disallowEmptySelection: true,
    autoFocus: state.focusStrategy || true,
    shouldSelectOnPressUp: true,
    focusOnPointerEnter: true,
    layout: layout,
    state: state,
    UNSAFE_className: listbox.listStyles,
    isLoading: isLoadingMore,
    onLoadMore: props.onLoadMore
  });

  // Measure the width of the button to inform the width of the menu (below).
  let [buttonWidth, setButtonWidth] = React.useState();
  let {
    scale
  } = core.useProvider();
  let onResize = React.useCallback(() => {
    if (!isMobile && triggerRef.current) {
      let width = triggerRef.current.offsetWidth;
      setButtonWidth(width);
    }
  }, [triggerRef, setButtonWidth, isMobile]);
  utils.useResizeObserver({
    ref: triggerRef,
    onResize: onResize
  });
  utils.useLayoutEffect(onResize, [scale, state.selectedKey, onResize]);
  let overlay;
  if (isMobile) {
    overlay = /*#__PURE__*/jsxRuntime.jsx(overlays.Tray, {
      state: state,
      children: listbox$1
    });
  } else {
    // Match the width of the button, unless explicitly overridden by the
    // consumer via `menuWidth` prop. The width should never be less than the
    // invoking button.
    let style = {
      minWidth: buttonWidth,
      width: menuWidth !== null && menuWidth !== void 0 ? menuWidth : buttonWidth
    };

    // FIXME: should close on blur
    // @see http://localhost:6006/?path=/story/pickers-picker--focus
    // open then tab to next element
    overlay = /*#__PURE__*/jsxRuntime.jsx(overlays.Popover, {
      UNSAFE_style: style,
      ref: popoverRef,
      placement: `${direction} ${align}`,
      shouldFlip: shouldFlip,
      hideArrow: true,
      state: state,
      triggerRef: triggerRef,
      scrollRef: listboxRef,
      children: listbox$1
    });
  }
  let contents = state.selectedItem ? state.selectedItem.rendered : placeholder;
  if (utils$1.isReactText(contents)) {
    contents = /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      children: contents
    });
  }
  let picker = /*#__PURE__*/jsxRuntime.jsxs("div", {
    children: [/*#__PURE__*/jsxRuntime.jsx(select$1.HiddenSelect, {
      autoComplete: autoComplete,
      isDisabled: isDisabled,
      label: label,
      name: name,
      state: state,
      triggerRef: triggerRef
    }), /*#__PURE__*/jsxRuntime.jsx(interactions.PressResponder, {
      ...triggerProps,
      children: /*#__PURE__*/jsxRuntime.jsxs(button.FieldButton, {
        "aria-required": true,
        prominence: prominence,
        ref: triggerRef,
        isActive: state.isOpen,
        isDisabled: isDisabled,
        autoFocus: autoFocus,
        UNSAFE_className: style.classNames(style.css({
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%',
          /* Ensure that changing the selected item doesn't affect the size of the dropdown and its parents */
          contain: 'size'
        })),
        children: [/*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
          slots: {
            icon: {
              marginEnd: 'small'
            },
            text: {
              ...valueProps,
              // when no item is selected, we're styling the placeholder
              color: !state.selectedItem ? 'neutralSecondary' : 'inherit',
              weight: state.selectedItem ? 'medium' : undefined
            },
            // we try to maintain most of the selected item's rendered content
            // within the button, but description text is too long
            description: {
              isHidden: true
            }
          },
          children: contents
        }), isLoadingInitial && /*#__PURE__*/jsxRuntime.jsx(progress.ProgressCircle, {
          isIndeterminate: true,
          size: "small",
          "aria-label": stringFormatter.format('loading'),
          UNSAFE_className: style.css({
            marginInlineStart: style.tokenSchema.size.space.small
          })
        }), /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: chevronsUpDownIcon.chevronsUpDownIcon,
          UNSAFE_className: style.css({
            marginInlineStart: style.tokenSchema.size.space.small
          })
        })]
      })
    }), state.collection.size === 0 ? null : overlay]
  });
  return /*#__PURE__*/jsxRuntime.jsx(field.FieldPrimitive, {
    width: "alias.singleLineWidth",
    ...props,
    ref: forwardedRef,
    labelProps: labelProps,
    descriptionProps: descriptionProps,
    errorMessageProps: errorMessageProps,
    supplementRequiredState: true,
    children: picker
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/**
 * Pickers allow users to choose a single option from a collapsible list of options when space is limited.
 */
const _Picker = /*#__PURE__*/React.forwardRef(Picker);

Object.defineProperty(exports, 'Item', {
  enumerable: true,
  get: function () { return collections.Item; }
});
Object.defineProperty(exports, 'Section', {
  enumerable: true,
  get: function () { return collections.Section; }
});
exports.Picker = _Picker;
