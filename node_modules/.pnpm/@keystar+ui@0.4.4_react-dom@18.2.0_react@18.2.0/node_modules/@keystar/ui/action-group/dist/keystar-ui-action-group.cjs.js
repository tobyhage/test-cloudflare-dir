'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var collections = require('@react-stately/collections');
var actiongroup = require('@react-aria/actiongroup');
var focus = require('@react-aria/focus');
var interactions = require('@react-aria/interactions');
var utils = require('@react-aria/utils');
var list = require('@react-stately/list');
var React = require('react');
var button = require('@keystar/ui/button');
var core = require('@keystar/ui/core');
var chevronDownIcon = require('@keystar/ui/icon/icons/chevronDownIcon');
var moreHorizontalIcon = require('@keystar/ui/icon/icons/moreHorizontalIcon');
var icon = require('@keystar/ui/icon');
var menu = require('@keystar/ui/menu');
var typography = require('@keystar/ui/typography');
var tooltip = require('@keystar/ui/tooltip');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var utils$1 = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');

function ActionGroup(props, forwardedRef) {
  props = core.useProviderProps(props);
  props = slots.useSlotProps(props, 'actionGroup');
  let {
    density,
    prominence,
    isJustified,
    isDisabled,
    orientation = 'horizontal',
    overflowMode,
    onAction,
    buttonLabelBehavior,
    summaryIcon,
    ...otherProps
  } = props;

  // High prominence buttons should be used sparingly and in isolation, so they
  // are not supported in groups.
  prominence = prominence === 'low' ? 'low' : 'default';
  let domRef = utils.useObjectRef(forwardedRef);
  let wrapperRef = React.useRef(null);
  let state = list.useListState({
    ...props,
    suppressTextValueWarning: true
  });
  let {
    actionGroupProps
  } = actiongroup.useActionGroup(props, state, domRef);
  let providerProps = {
    isDisabled
  };
  let styleProps = style.useStyleProps(props);

  // Only hide button text if every item contains more than just plain text (we assume an icon).
  let isIconCollapsible = React.useMemo(() => [...state.collection].every(item => typeof item.rendered !== 'string'), [state.collection]);
  let [{
    visibleItems,
    hideButtonText,
    isMeasuring
  }, setVisibleItems] = utils.useValueEffect({
    visibleItems: state.collection.size,
    hideButtonText: buttonLabelBehavior === 'hide' && isIconCollapsible,
    isMeasuring: false
  });
  let selectionMode = state.selectionManager.selectionMode;
  let updateOverflow = React.useCallback(() => {
    if (overflowMode !== 'collapse') {
      return;
    }
    if (orientation === 'vertical' && selectionMode !== 'none') {
      // Collapsing vertical action groups with selection is currently unsupported.
      return;
    }
    let computeVisibleItems = visibleItems => {
      if (domRef.current && wrapperRef.current) {
        let listItems = Array.from(domRef.current.children);
        let containerSize = orientation === 'horizontal' ? wrapperRef.current.offsetWidth : wrapperRef.current.offsetHeight;
        let isShowingMenu = visibleItems < state.collection.size;
        let calculatedSize = 0;
        let newVisibleItems = 0;
        if (isShowingMenu) {
          let item = listItems.pop();
          if (item) {
            calculatedSize += orientation === 'horizontal' ? outerWidth(item, false, true) : outerHeight(item, false, true);
          }
        }
        for (let [i, item] of listItems.entries()) {
          calculatedSize += orientation === 'horizontal' ? outerWidth(item, i === 0, i === listItems.length - 1) : outerHeight(item, i === 0, i === listItems.length - 1);
          if (calculatedSize <= containerSize) {
            newVisibleItems++;
          } else {
            break;
          }
        }

        // If selection is enabled, and not all of the items fit, collapse all of them into a dropdown
        // immediately rather than having some visible and some not.
        if (selectionMode === 'single' && newVisibleItems < state.collection.size) {
          return 0;
        }
        return newVisibleItems;
      }
      return visibleItems;
    };
    setVisibleItems(function* () {
      let hideButtonText = buttonLabelBehavior === 'hide' && isIconCollapsible;

      // Update to show all items.
      yield {
        visibleItems: state.collection.size,
        hideButtonText,
        isMeasuring: true
      };

      // Measure, and update to show the items that fit.
      let newVisibleItems = computeVisibleItems(state.collection.size);
      let isMeasuring = newVisibleItems < state.collection.size && newVisibleItems > 0;

      // If not all of the buttons fit, and buttonLabelBehavior is 'collapse', then first try hiding
      // the button text and only showing icons. Only if that still doesn't fit collapse into a menu.
      if (newVisibleItems < state.collection.size && buttonLabelBehavior === 'collapse' && isIconCollapsible) {
        yield {
          visibleItems: state.collection.size,
          hideButtonText: true,
          isMeasuring: true
        };
        newVisibleItems = computeVisibleItems(state.collection.size);
        isMeasuring = newVisibleItems < state.collection.size && newVisibleItems > 0;
        hideButtonText = true;
      }
      yield {
        visibleItems: newVisibleItems,
        hideButtonText,
        isMeasuring
      };

      // If the number of items is less than the number of children,
      // then update again to ensure that the menu fits.
      if (isMeasuring) {
        yield {
          visibleItems: computeVisibleItems(newVisibleItems),
          hideButtonText,
          isMeasuring: false
        };
      }
    });
  }, [domRef, state.collection, setVisibleItems, overflowMode, selectionMode, buttonLabelBehavior, isIconCollapsible, orientation]);

  // Watch the parent element for size changes. Watching only the action group itself may not work
  // in all scenarios because it may not shrink when available space is reduced.
  let parentRef = React.useMemo(() => ({
    get current() {
      var _wrapperRef$current;
      return (_wrapperRef$current = wrapperRef.current) === null || _wrapperRef$current === void 0 ? void 0 : _wrapperRef$current.parentElement;
    }
  }), [wrapperRef]);
  utils.useResizeObserver({
    ref: overflowMode !== 'wrap' ? parentRef : undefined,
    onResize: updateOverflow
  });
  utils.useLayoutEffect(updateOverflow, [updateOverflow, state.collection]);
  let children = [...state.collection];
  let menuItem = null;
  let menuProps = {};

  // If there are no visible items, don't apply any props to the action group container
  // and pass all aria labeling props through to the menu button.
  if (overflowMode === 'collapse' && visibleItems === 0) {
    menuProps = utils.filterDOMProps(props, {
      labelable: true
    });
    actionGroupProps = {};
  }
  if (overflowMode === 'collapse' && visibleItems < state.collection.size) {
    let menuChildren = children.slice(visibleItems);
    children = children.slice(0, visibleItems);
    menuItem = /*#__PURE__*/jsxRuntime.jsx(ActionGroupMenu, {
      ...menuProps,
      items: menuChildren,
      prominence: prominence,
      onAction: onAction,
      isDisabled: isDisabled,
      state: state,
      summaryIcon: summaryIcon,
      hideButtonText: hideButtonText,
      isOnlyItem: visibleItems === 0,
      orientation: orientation
    });
  }
  let style$1 = {
    ...styleProps.style,
    // While measuring, take up as much space as possible.
    flexBasis: isMeasuring ? '100%' : undefined
  };
  return /*#__PURE__*/jsxRuntime.jsx(focus.FocusScope, {
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      ...styleProps,
      style: style$1,
      className: style.classNames(style.css({
        display: 'flex',
        maxWidth: '100%'
      }), styleProps.className),
      ref: wrapperRef,
      children: /*#__PURE__*/jsxRuntime.jsx("div", {
        ...actionGroupProps,
        ...style.toDataAttributes({
          overflow: overflowMode,
          prominence,
          justified: isJustified && !isMeasuring || undefined,
          compact: density === 'compact' || undefined,
          vertical: orientation === 'vertical' || undefined
        }),
        ref: domRef,
        className: style.classNames(style.css({
          display: 'flex',
          // gap: tokenSchema.size.space.regular,
          // NOTE: `gap` seems to break the measurement/collapse logic, so we use margin instead.
          width: 'calc(100% + var(--action-item-gap) + 1px)',
          margin: `calc(var(--action-item-gap) / -2)`,
          '--action-item-gap': style.tokenSchema.size.space.regular,
          [button.actionButtonClassList.selector('root', 'child')]: {
            margin: `calc(var(--action-item-gap) / 2)`
          },
          // wrap
          '&[data-overflow=wrap]': {
            flexWrap: 'wrap'
          },
          // justified
          '&[data-justified]': {
            [button.actionButtonClassList.selector('root', 'child')]: {
              flexGrow: 1
            }
          },
          // compact
          '&[data-compact]:not([data-prominence=low])': {
            '--action-item-gap': 0,
            // gap: 0,

            [button.actionButtonClassList.selector('root', 'child')]: {
              borderRadius: 0,
              '&:first-of-type': {
                borderTopLeftRadius: style.tokenSchema.size.radius.regular,
                borderBottomLeftRadius: style.tokenSchema.size.radius.regular
              },
              '&:last-of-type': {
                borderTopRightRadius: style.tokenSchema.size.radius.regular,
                borderBottomRightRadius: style.tokenSchema.size.radius.regular
              },
              '&:not(:last-of-type)': {
                marginRight: `calc(${style.tokenSchema.size.border.regular} * -1)`
              },
              '&.is-hovered, &.is-focused, &.is-pressed': {
                zIndex: 1
              },
              '&.is-selected': {
                zIndex: 2
              }
            }
          },
          '&[data-compact][data-prominence=low]': {
            '--action-item-gap': style.tokenSchema.size.space.small
          }
        }), otherProps.UNSAFE_className),
        children: /*#__PURE__*/jsxRuntime.jsxs(core.KeystarProvider, {
          ...providerProps,
          children: [children.map(item => /*#__PURE__*/jsxRuntime.jsx(ActionGroupItem, {
            onAction: onAction,
            prominence: prominence,
            isDisabled: isDisabled,
            item: item,
            state: state,
            hideButtonText: hideButtonText,
            orientation: orientation
          }, item.key)), menuItem]
        })
      })
    })
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/** Group related action buttons together. */
const _ActionGroup = /*#__PURE__*/React.forwardRef(ActionGroup);
function ActionGroupItem({
  item,
  state,
  isDisabled,
  onAction,
  hideButtonText,
  orientation,
  prominence
}) {
  let ref = React.useRef(null);
  let {
    buttonProps
  } = actiongroup.useActionGroupItem({
    key: item.key
  }, state);
  isDisabled = isDisabled || state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key);
  let domProps = utils.filterDOMProps(item.props);
  if (onAction && !isDisabled) {
    buttonProps = utils.mergeProps(buttonProps, {
      onPress: () => onAction(item.key)
    });
  }

  // If button text is hidden, we need to show it as a tooltip instead, so
  // go find the text element in the DOM after rendering.
  let textId = utils.useId();
  let kbdId = utils.useId();
  let [textContent, setTextContent] = React.useState('');
  let [kbdContent, setKbdContent] = React.useState('');
  utils.useLayoutEffect(() => {
    if (hideButtonText) {
      var _document$getElementB, _document$getElementB2;
      setTextContent((_document$getElementB = document.getElementById(textId)) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.textContent);
      setKbdContent((_document$getElementB2 = document.getElementById(kbdId)) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.textContent);
    }
  }, [hideButtonText, item.rendered, textId, kbdId]);
  let button$1 =
  /*#__PURE__*/
  // Use a PressResponder to send DOM props through.
  // Button doesn't allow overriding the role by default.
  jsxRuntime.jsx(interactions.PressResponder, {
    ...utils.mergeProps(buttonProps, domProps),
    children: /*#__PURE__*/jsxRuntime.jsx(slots.ClearSlots, {
      children: /*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
        slots: {
          kbd: {
            id: hideButtonText ? kbdId : undefined,
            isHidden: true // always hide kbd in buttons
          },

          text: {
            id: hideButtonText ? textId : undefined,
            isHidden: hideButtonText
          }
        },
        children: /*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
          ...item.props,
          prominence: prominence,
          ref: ref,
          UNSAFE_className: style.classNames(style.css({
            flexShrink: 0
          })),
          isSelected: isSelected,
          isDisabled: isDisabled
          // data-contents={hideButtonText ? 'icon' : undefined}
          ,
          "aria-label": item['aria-label'],
          "aria-labelledby": item['aria-label'] == null && hideButtonText ? textId : undefined,
          children: item.rendered
        })
      })
    })
  });
  if (hideButtonText && textContent) {
    button$1 = /*#__PURE__*/jsxRuntime.jsxs(tooltip.TooltipTrigger, {
      placement: orientation === 'vertical' ? 'end' : 'top',
      children: [button$1, /*#__PURE__*/jsxRuntime.jsx(tooltip.Tooltip, {
        children: kbdContent ? /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [/*#__PURE__*/jsxRuntime.jsx(typography.Text, {
            children: textContent
          }), /*#__PURE__*/jsxRuntime.jsx(typography.Kbd, {
            children: kbdContent
          })]
        }) : textContent
      })]
    });
  }
  if (item.wrapper) {
    button$1 = item.wrapper(button$1);
  }
  return button$1;
}
function ActionGroupMenu({
  hideButtonText,
  isDisabled,
  isOnlyItem,
  items,
  onAction,
  orientation,
  prominence,
  state,
  staticColor,
  summaryIcon,
  ...otherProps
}) {
  // Use the key of the first item within the menu as the key of the button.
  // The key must actually exist in the collection for focus to work correctly.
  let key = items[0].key;
  let {
    buttonProps
  } = actiongroup.useActionGroupItem({
    key
  }, state);

  // The menu button shouldn't act like an actual action group item.
  delete buttonProps.onPress;
  delete buttonProps.role;
  delete buttonProps['aria-checked'];

  // If no aria-label or aria-labelledby is given, provide a default one.
  let ariaLabel = otherProps['aria-label'] || (otherProps['aria-labelledby'] ? undefined : '…');
  let ariaLabelledby = otherProps['aria-labelledby'];
  let textId = utils.useId();
  let id = utils.useId();

  // Summary icon only applies when selection is enabled.
  if (state.selectionManager.selectionMode === 'none') {
    summaryIcon = null;
  }

  // If there is a selection, show the selected state on the menu button.
  let isSelected = state.selectionManager.selectionMode !== 'none' && items.some(i => state.selectionManager.isSelected(i.key));

  // If single selection and empty selection is not allowed, swap the contents of the button to the selected item (like a Picker).
  if (!summaryIcon && state.selectionManager.selectionMode === 'single' && state.selectionManager.disallowEmptySelection && state.selectionManager.firstSelectedKey != null) {
    let selectedItem = state.collection.getItem(state.selectionManager.firstSelectedKey);
    if (selectedItem) {
      var _ariaLabelledby;
      summaryIcon = selectedItem.rendered;
      if (utils$1.isReactText(summaryIcon)) {
        summaryIcon = /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
          children: summaryIcon
        });
      }
      ariaLabelledby = `${(_ariaLabelledby = ariaLabelledby) !== null && _ariaLabelledby !== void 0 ? _ariaLabelledby : id} ${textId}`;
    }
  }
  if (summaryIcon) {
    // If there's a custom summary icon, also add a chevron.
    summaryIcon = /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
      children: [summaryIcon, /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
        src: chevronDownIcon.chevronDownIcon
      })]
    });
  }
  return (
    /*#__PURE__*/
    // Use a PressResponder to send DOM props through.
    jsxRuntime.jsxs(menu.MenuTrigger, {
      align: isOnlyItem ? 'start' : 'end',
      direction: orientation === 'vertical' ? 'end' : 'bottom',
      children: [/*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
        slots: {
          text: {
            id: hideButtonText ? textId : undefined,
            isHidden: hideButtonText
          }
        },
        children: /*#__PURE__*/jsxRuntime.jsx(interactions.PressResponder, {
          ...buttonProps,
          children: /*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
            ...otherProps,
            id: id,
            prominence: prominence,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledby,
            isDisabled: isDisabled,
            isSelected: isSelected,
            children: summaryIcon || /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
              src: moreHorizontalIcon.moreHorizontalIcon
            })
          })
        })
      }), /*#__PURE__*/jsxRuntime.jsx(menu.Menu, {
        items: items,
        disabledKeys: state.disabledKeys,
        selectionMode: state.selectionManager.selectionMode,
        selectedKeys: state.selectionManager.selectedKeys,
        disallowEmptySelection: state.selectionManager.disallowEmptySelection,
        onSelectionChange: keys => state.selectionManager.setSelectedKeys(keys),
        onAction: onAction,
        children: node => /*#__PURE__*/jsxRuntime.jsx(menu.Item, {
          ...node.props,
          textValue: node.textValue,
          children: node.rendered
        })
      })]
    })
  );
}
function outerWidth(element, ignoreLeftMargin, ignoreRightMargin) {
  let style = window.getComputedStyle(element);
  return element.offsetWidth + (ignoreLeftMargin ? 0 : toNumber(style.marginLeft)) + (ignoreRightMargin ? 0 : toNumber(style.marginRight));
}
function outerHeight(element, ignoreTopMargin, ignoreBottomMargin) {
  let style = window.getComputedStyle(element);
  return element.offsetHeight + (ignoreTopMargin ? 0 : toNumber(style.marginTop)) + (ignoreBottomMargin ? 0 : toNumber(style.marginBottom));
}
function toNumber(value) {
  let parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

Object.defineProperty(exports, 'Item', {
  enumerable: true,
  get: function () { return collections.Item; }
});
exports.ActionGroup = _ActionGroup;
