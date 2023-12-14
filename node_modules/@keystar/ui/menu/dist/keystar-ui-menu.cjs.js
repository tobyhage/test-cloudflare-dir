'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var collections = require('@react-stately/collections');
var i18n = require('@react-aria/i18n');
var utils$1 = require('@react-aria/utils');
var React = require('react');
var menu = require('@react-aria/menu');
var tree = require('@react-stately/tree');
var listbox = require('@keystar/ui/listbox');
var style = require('@keystar/ui/style');
var focus = require('@react-aria/focus');
var interactions = require('@react-aria/interactions');
var typography = require('@keystar/ui/typography');
var utils = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');
var separator = require('@react-aria/separator');
var layout = require('@keystar/ui/layout');
var menu$1 = require('@react-stately/menu');
var overlays = require('@keystar/ui/overlays');
var slots = require('@keystar/ui/slots');
var button = require('@keystar/ui/button');
var icon = require('@keystar/ui/icon');
var moreHorizontalIcon = require('@keystar/ui/icon/icons/moreHorizontalIcon');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

var localizedMessages = {
	"ar-AE": {
		moreActions: "المزيد من الإجراءات"
	},
	"bg-BG": {
		moreActions: "Повече действия"
	},
	"cs-CZ": {
		moreActions: "Další akce"
	},
	"da-DK": {
		moreActions: "Flere handlinger"
	},
	"de-DE": {
		moreActions: "Mehr Aktionen"
	},
	"el-GR": {
		moreActions: "Περισσότερες ενέργειες"
	},
	"en-US": {
		moreActions: "More actions"
	},
	"es-ES": {
		moreActions: "Más acciones"
	},
	"et-EE": {
		moreActions: "Veel toiminguid"
	},
	"fi-FI": {
		moreActions: "Lisää toimintoja"
	},
	"fr-FR": {
		moreActions: "Autres actions"
	},
	"he-IL": {
		moreActions: "פעולות נוספות"
	},
	"hr-HR": {
		moreActions: "Dodatne radnje"
	},
	"hu-HU": {
		moreActions: "További lehetőségek"
	},
	"it-IT": {
		moreActions: "Altre azioni"
	},
	"ja-JP": {
		moreActions: "その他のアクション"
	},
	"ko-KR": {
		moreActions: "기타 작업"
	},
	"lt-LT": {
		moreActions: "Daugiau veiksmų"
	},
	"lv-LV": {
		moreActions: "Citas darbības"
	},
	"nb-NO": {
		moreActions: "Flere handlinger"
	},
	"nl-NL": {
		moreActions: "Meer handelingen"
	},
	"pl-PL": {
		moreActions: "Więcej akcji"
	},
	"pt-BR": {
		moreActions: "Mais ações"
	},
	"pt-PT": {
		moreActions: "Mais ações"
	},
	"ro-RO": {
		moreActions: "Mai multe acțiuni"
	},
	"ru-RU": {
		moreActions: "Дополнительные действия"
	},
	"sk-SK": {
		moreActions: "Ďalšie akcie"
	},
	"sl-SI": {
		moreActions: "Več možnosti"
	},
	"sr-SP": {
		moreActions: "Dodatne radnje"
	},
	"sv-SE": {
		moreActions: "Fler åtgärder"
	},
	"tr-TR": {
		moreActions: "Daha fazla eylem"
	},
	"uk-UA": {
		moreActions: "Більше дій"
	},
	"zh-CN": {
		moreActions: "更多操作"
	},
	"zh-TW": {
		moreActions: "更多動作"
	}
};

const MenuContext = /*#__PURE__*/React__default["default"].createContext({});
function useMenuContext() {
  return React.useContext(MenuContext);
}

/** @private */
function MenuItem(props) {
  let {
    item,
    state,
    isVirtualized,
    onAction
  } = props;
  let {
    onClose,
    closeOnSelect
  } = useMenuContext();
  let {
    rendered,
    key
  } = item;
  let isSelected = state.selectionManager.isSelected(key);
  let isDisabled = state.selectionManager.isDisabled(key);
  let ref = React.useRef(null);
  let {
    menuItemProps,
    labelProps,
    descriptionProps,
    keyboardShortcutProps
  } = menu.useMenuItem({
    isSelected,
    isDisabled,
    'aria-label': item['aria-label'],
    key,
    onClose,
    closeOnSelect,
    isVirtualized,
    onAction
  }, state, ref);
  let {
    hoverProps,
    isHovered
  } = interactions.useHover({
    isDisabled
  });
  let {
    focusProps,
    isFocusVisible
  } = focus.useFocusRing();
  let contents = utils.isReactText(rendered) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
    children: rendered
  }) : rendered;
  // NOTE: Support for `disabledBehavior` is not yet implemented in react-aria.
  let role = state.selectionManager.disabledBehavior === 'selection' && state.disabledKeys.has(key) ? 'menuitem' : undefined;
  return /*#__PURE__*/jsxRuntime.jsx(listbox.ListItem, {
    ...utils$1.mergeProps(menuItemProps, {
      role
    }, hoverProps, focusProps),
    elementType: item.props.href ? 'a' : 'div',
    descriptionProps: descriptionProps,
    keyboardShortcutProps: keyboardShortcutProps,
    labelProps: labelProps,
    isHovered: isHovered,
    isFocused: isFocusVisible,
    isSelected: isSelected,
    ref: ref,
    children: contents
  });
}

/** @private */
function MenuSection(props) {
  let {
    item,
    state,
    onAction
  } = props;
  let {
    itemProps,
    headingProps,
    groupProps
  } = menu.useMenuSection({
    heading: item.rendered,
    'aria-label': item['aria-label']
  });
  let {
    separatorProps
  } = separator.useSeparator({});
  return /*#__PURE__*/jsxRuntime.jsxs(React.Fragment, {
    children: [item.key !== state.collection.getFirstKey() && /*#__PURE__*/jsxRuntime.jsx(layout.Divider, {
      ...separatorProps,
      marginY: "small"
    }), /*#__PURE__*/jsxRuntime.jsxs("div", {
      ...itemProps,
      children: [item.rendered && /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
        casing: "uppercase",
        size: "small",
        color: "neutralSecondary",
        weight: "medium",
        UNSAFE_className: style.css({
          paddingBlock: style.tokenSchema.size.space.regular,
          paddingInline: style.tokenSchema.size.space.medium
        }),
        ...headingProps,
        children: item.rendered
      }), /*#__PURE__*/jsxRuntime.jsx("div", {
        ...groupProps,
        children: [...collections.getChildNodes(item, state.collection)].map(node => {
          let item = /*#__PURE__*/jsxRuntime.jsx(MenuItem, {
            item: node,
            state: state,
            onAction: onAction
          }, node.key);
          if (node.wrapper) {
            item = node.wrapper(item);
          }
          return item;
        })
      })]
    })]
  });
}

function Menu(props, forwardedRef) {
  let contextProps = React.useContext(MenuContext);
  let completeProps = {
    ...utils$1.mergeProps(contextProps, props)
  };
  let domRef = utils$1.useObjectRef(forwardedRef);
  let state = tree.useTreeState(completeProps);
  let {
    menuProps
  } = menu.useMenu(completeProps, state, domRef);
  let styleProps = style.useStyleProps(completeProps);
  utils$1.useSyncRef(contextProps, domRef);
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    ...menuProps,
    ...styleProps,
    ref: domRef,
    className: style.classNames(listbox.listStyles, styleProps.className),
    "data-selection": state.selectionManager.selectionMode,
    children: [...state.collection].map(item => {
      if (item.type === 'section') {
        return /*#__PURE__*/jsxRuntime.jsx(MenuSection, {
          item: item,
          state: state,
          onAction: completeProps.onAction
        }, item.key);
      }
      let menuItem = /*#__PURE__*/jsxRuntime.jsx(MenuItem, {
        item: item,
        state: state,
        onAction: completeProps.onAction
      }, item.key);
      if (item.wrapper) {
        menuItem = item.wrapper(menuItem);
      }
      return menuItem;
    })
  });
}

/**
 * Menus display a list of actions or options that a user can choose.
 */
// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Menu = /*#__PURE__*/React__default["default"].forwardRef(Menu);

/**
 * The MenuTrigger serves as a wrapper around a Menu and its associated trigger,
 * linking the Menu's open state with the trigger's press state.
 */
const MenuTrigger = /*#__PURE__*/React.forwardRef(function MenuTrigger(props, forwardedRef) {
  let triggerRef = React.useRef(null);
  let domRef = utils$1.useObjectRef(forwardedRef);
  let menuTriggerRef = domRef || triggerRef;
  let menuRef = React.useRef(null);
  let {
    children,
    align = 'start',
    shouldFlip = true,
    direction = 'bottom',
    closeOnSelect,
    trigger = 'press'
  } = props;
  let [menuTrigger, menu$2] = React__default["default"].Children.toArray(children);
  let state = menu$1.useMenuTriggerState(props);
  let {
    menuTriggerProps,
    menuProps
  } = menu.useMenuTrigger({
    trigger
  }, state, menuTriggerRef);
  let initialPlacement;
  switch (direction) {
    case 'left':
    case 'right':
    case 'start':
    case 'end':
      initialPlacement = `${direction} ${align === 'end' ? 'bottom' : 'top'}`;
      break;
    case 'bottom':
    case 'top':
    default:
      initialPlacement = `${direction} ${align}`;
  }
  let isMobile = style.useIsMobileDevice();
  let menuContext = {
    ...menuProps,
    ref: menuRef,
    onClose: state.close,
    closeOnSelect,
    autoFocus: state.focusStrategy || true,
    UNSAFE_style: isMobile ? {
      width: '100%',
      maxHeight: 'inherit'
    } : {
      maxWidth: style.tokenSchema.size.dialog.xsmall
    }
  };

  // On small screen devices, the menu is rendered in a tray, otherwise a popover.
  let overlay;
  if (isMobile) {
    overlay = /*#__PURE__*/jsxRuntime.jsx(overlays.Tray, {
      state: state,
      children: menu$2
    });
  } else {
    overlay = /*#__PURE__*/jsxRuntime.jsx(overlays.Popover, {
      state: state,
      triggerRef: menuTriggerRef,
      scrollRef: menuRef,
      placement: initialPlacement,
      hideArrow: true,
      shouldFlip: shouldFlip,
      children: menu$2
    });
  }
  return /*#__PURE__*/jsxRuntime.jsxs(React.Fragment, {
    children: [/*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
      slots: {
        actionButton: {
          holdAffordance: trigger === 'longPress'
        }
      },
      children: /*#__PURE__*/jsxRuntime.jsx(interactions.PressResponder, {
        ...menuTriggerProps,
        ref: menuTriggerRef,
        isPressed: state.isOpen,
        children: menuTrigger
      })
    }), /*#__PURE__*/jsxRuntime.jsx(MenuContext.Provider, {
      // TODO: Fix this type error
      // @ts-expect-error
      value: menuContext,
      children: overlay
    })]
  });
});

function ActionMenu(props, ref) {
  props = slots.useSlotProps(props, 'actionMenu');
  let stringFormatter = i18n.useLocalizedStringFormatter(localizedMessages);
  let buttonProps = utils$1.filterDOMProps(props, {
    labelable: true
  });
  if (buttonProps['aria-label'] === undefined) {
    buttonProps['aria-label'] = stringFormatter.format('moreActions');
  }
  return /*#__PURE__*/jsxRuntime.jsxs(MenuTrigger, {
    isOpen: props.isOpen,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    align: props.align,
    direction: props.direction,
    shouldFlip: props.shouldFlip,
    children: [/*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
      ref: ref,
      ...props,
      ...buttonProps,
      children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
        src: moreHorizontalIcon.moreHorizontalIcon
      })
    }), /*#__PURE__*/jsxRuntime.jsx(_Menu, {
      children: props.children,
      items: props.items,
      disabledKeys: props.disabledKeys,
      onAction: props.onAction
    })]
  });
}

/**
 * ActionMenu combines an ActionButton with a Menu for simple "more actions" use cases.
 */
const _ActionMenu = /*#__PURE__*/React.forwardRef(ActionMenu);

Object.defineProperty(exports, 'Item', {
  enumerable: true,
  get: function () { return collections.Item; }
});
Object.defineProperty(exports, 'Section', {
  enumerable: true,
  get: function () { return collections.Section; }
});
exports.ActionMenu = _ActionMenu;
exports.Menu = _Menu;
exports.MenuTrigger = MenuTrigger;
