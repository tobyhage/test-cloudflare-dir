'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var collections = require('@react-stately/collections');
var i18n = require('@react-aria/i18n');
var interactions = require('@react-aria/interactions');
var selection = require('@react-aria/selection');
var utils$1 = require('@react-aria/utils');
var tree = require('@react-stately/tree');
var React = require('react');
var icon = require('@keystar/ui/icon');
var chevronLeftIcon = require('@keystar/ui/icon/icons/chevronLeftIcon');
var chevronRightIcon = require('@keystar/ui/icon/icons/chevronRightIcon');
var dotIcon = require('@keystar/ui/icon/icons/dotIcon');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils = require('@keystar/ui/utils');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

class TreeKeyboardDelegate {
  constructor(collator, collection, disabledKeys) {
    this.collator = collator;
    this.collection = collection;
    this.disabledKeys = disabledKeys;
  }
  getKeyAbove(key) {
    let {
      collection,
      disabledKeys
    } = this;
    let keyBefore = collection.getKeyBefore(key);
    while (keyBefore !== null) {
      let item = collection.getItem(keyBefore);
      if ((item === null || item === void 0 ? void 0 : item.type) === 'item' && !disabledKeys.has(item.key)) {
        return keyBefore;
      }
      keyBefore = collection.getKeyBefore(keyBefore);
    }
    return null;
  }
  getKeyBelow(key) {
    let {
      collection,
      disabledKeys
    } = this;
    let keyBelow = collection.getKeyAfter(key);
    while (keyBelow !== null) {
      let item = collection.getItem(keyBelow);
      if ((item === null || item === void 0 ? void 0 : item.type) === 'item' && !disabledKeys.has(item.key)) {
        return keyBelow;
      }
      keyBelow = collection.getKeyAfter(keyBelow);
    }
    return null;
  }
  getFirstKey() {
    let {
      collection,
      disabledKeys
    } = this;
    let key = collection.getFirstKey();
    while (key !== null) {
      let item = collection.getItem(key);
      if ((item === null || item === void 0 ? void 0 : item.type) === 'item' && !disabledKeys.has(item.key)) {
        return key;
      }
      key = collection.getKeyAfter(key);
    }
    return null;
  }
  getLastKey() {
    let {
      collection,
      disabledKeys
    } = this;
    let key = collection.getLastKey();
    while (key !== null) {
      let item = collection.getItem(key);
      if ((item === null || item === void 0 ? void 0 : item.type) === 'item' && !disabledKeys.has(item.key)) {
        return key;
      }
      key = collection.getKeyBefore(key);
    }
    return null;
  }
  getKeyForSearch(search, fromKey = this.getFirstKey()) {
    let {
      collator,
      collection
    } = this;
    let key = fromKey;
    while (key !== null) {
      let item = collection.getItem(key);
      if (item !== null && item !== void 0 && item.textValue && collator.compare(search, item.textValue.slice(0, search.length)) === 0) {
        return key;
      }
      key = this.getKeyBelow(key);
    }
    return null;
  }
}

const TreeContext = /*#__PURE__*/React.createContext(null);
function useTreeContext() {
  let context = React.useContext(TreeContext);
  if (context === null) {
    throw new Error('NavTree: missing context');
  }
  return context;
}
function NavTree(props) {
  let {
    onAction,
    onSelectionChange,
    selectedKey,
    ...otherProps
  } = props;
  let ref = React.useRef(null);
  let styleProps = style.useStyleProps(props);

  // tweak selection behaviour
  let [selectedAncestralKeys, setSelectedAncestralKeys] = React__default["default"].useState([]);
  let selectionProps = React.useMemo(() => {
    if (selectedKey) {
      let selectedKeys = new Set([selectedKey]);
      return {
        selectedKeys,
        selectionMode: 'single'
      };
    }
    return {};
  }, [selectedKey]);

  // tree state
  let state = tree.useTreeState({
    ...otherProps,
    ...selectionProps
  });
  let collator = i18n.useCollator({
    usage: 'search',
    sensitivity: 'base'
  });
  let keyboardDelegate = React.useMemo(() => new TreeKeyboardDelegate(collator, state.collection, state.disabledKeys), [collator, state.collection, state.disabledKeys]);
  let {
    collectionProps
  } = selection.useSelectableCollection({
    ...props,
    allowsTabNavigation: true,
    keyboardDelegate,
    ref,
    selectionManager: state.selectionManager
  });
  let id = React.useId();
  let context = React.useMemo(() => ({
    id,
    onAction,
    onSelectionChange,
    selectedAncestralKeys
  }), [id, onAction, onSelectionChange, selectedAncestralKeys]);
  React.useEffect(() => {
    if (state.selectionManager.firstSelectedKey) {
      let item = state.collection.getItem(state.selectionManager.firstSelectedKey);
      if (item) {
        let ancestors = getAncestors(state.collection, item);
        setSelectedAncestralKeys(ancestors.map(item => item.key));
      }
    }
  }, [state.collection, state.selectionManager.firstSelectedKey]);
  return /*#__PURE__*/jsxRuntime.jsx(TreeContext.Provider, {
    value: context,
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      ...collectionProps,
      ...styleProps,
      className: style.classNames(styleProps.className, style.css({
        outline: 'none'
      })),
      ref: ref,
      role: "treegrid",
      children: resolveTreeNodes({
        nodes: state.collection,
        state
      })
    })
  });
}
function resolveTreeNodes({
  nodes,
  state
}) {
  return Array.from(nodes).map(node => {
    let Comp = node.type === 'section' ? TreeSection : TreeItem;
    return /*#__PURE__*/jsxRuntime.jsx(Comp, {
      node: node,
      state: state
    }, node.key);
  });
}

// TODO: review accessibility
function TreeSection({
  node,
  state
}) {
  return /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      role: "rowgroup",
      children: /*#__PURE__*/jsxRuntime.jsx("div", {
        role: "row",
        children: /*#__PURE__*/jsxRuntime.jsx("div", {
          role: "columnheader",
          "aria-sort": "none",
          children: /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
            casing: "uppercase",
            size: "small",
            color: "neutralSecondary",
            weight: "medium",
            UNSAFE_className: style.css({
              paddingBlock: style.tokenSchema.size.space.medium,
              paddingInline: style.tokenSchema.size.space.medium
            }),
            children: node.rendered
          })
        })
      })
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      role: "rowgroup",
      children: resolveTreeNodes({
        nodes: collections.getChildNodes(node, state.collection),
        state
      })
    })]
  });
}
function TreeItem({
  node,
  state
}) {
  let ref = React.useRef(null);
  let {
    direction
  } = i18n.useLocale();
  let {
    itemProps,
    isExpanded,
    isPressed,
    isHovered,
    isFocused,
    isSelectedAncestor
  } = useTreeItem({
    node
  }, state, ref);
  let isRtl = direction === 'rtl';
  let contents = utils.isReactText(node.rendered) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
    children: node.rendered
  }) : node.rendered;
  let itemClassName = style.css({
    color: style.tokenSchema.color.alias.foregroundIdle,
    cursor: 'default',
    fontWeight: style.tokenSchema.typography.fontWeight.medium,
    position: 'relative',
    outline: 'none',
    padding: style.tokenSchema.size.alias.focusRing,
    paddingInlineStart: style.tokenSchema.size.space.regular
  });
  let itemStyle = React.useCallback((...selectors) => selectors.map(selector => `.${itemClassName}${selector}`).join(', '), [itemClassName]);
  return /*#__PURE__*/jsxRuntime.jsxs(slots.SlotProvider, {
    slots: {
      button: {
        isHidden: !(isFocused && interactions.isFocusVisible()) && !isHovered,
        elementType: 'span',
        marginStart: 'auto',
        prominence: 'low'
      },
      text: {
        color: 'inherit',
        truncate: true,
        weight: 'inherit'
      }
    },
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      ...itemProps,
      ...style.toDataAttributes({
        selectedAncestor: isSelectedAncestor || undefined,
        hovered: isHovered || undefined,
        pressed: isPressed || undefined,
        focused: isFocused ? interactions.isFocusVisible() ? 'visible' : 'true' : undefined
      }),
      ref: ref,
      role: "row",
      className: itemClassName,
      children: /*#__PURE__*/jsxRuntime.jsxs("div", {
        role: "gridcell",
        className: style.css({
          alignItems: 'center',
          // borderRadius: `calc(${tokenSchema.size.radius.regular} + ${tokenSchema.size.alias.focusRing})`,
          borderRadius: style.tokenSchema.size.radius.regular,
          display: 'flex',
          gap: style.tokenSchema.size.space.small,
          minHeight: style.tokenSchema.size.element.regular,
          paddingInlineStart: `calc(${style.tokenSchema.size.space.regular} * var(--inset))`,
          '[role=rowgroup] &': {
            paddingInlineStart: `calc(${style.tokenSchema.size.space.regular} * calc(var(--inset) - 1))`
          },
          // interaction states
          [itemStyle('[data-hovered] > &')]: {
            backgroundColor: style.tokenSchema.color.alias.backgroundHovered,
            color: style.tokenSchema.color.alias.foregroundHovered
          },
          [itemStyle('[data-pressed] > &')]: {
            backgroundColor: style.tokenSchema.color.alias.backgroundPressed,
            color: style.tokenSchema.color.alias.foregroundPressed
          },
          [itemStyle('[data-focused=visible] > &')]: {
            outline: `${style.tokenSchema.size.alias.focusRing} solid ${style.tokenSchema.color.alias.focusRing}`
          },
          // indicate when a collapsed item contains the selected item, so
          // that the user always knows where they are in the tree
          [itemStyle('[data-selected-ancestor=true][aria-expanded=false] > &')]: {
            '&::before': {
              backgroundColor: style.tokenSchema.color.background.accentEmphasis,
              borderRadius: style.tokenSchema.size.space.small,
              content: '""',
              insetBlockStart: `50%`,
              insetInlineStart: 0,
              marginBlockStart: `calc(${style.tokenSchema.size.space.medium} / 2 * -1)`,
              position: 'absolute',
              height: style.tokenSchema.size.space.medium,
              width: style.tokenSchema.size.space.small
            }
          },
          // selected item
          [itemStyle('[aria-current=page] > &')]: {
            backgroundColor: style.tokenSchema.color.alias.backgroundHovered,
            color: style.tokenSchema.color.alias.foregroundHovered,
            fontWeight: style.tokenSchema.typography.fontWeight.semibold,
            '&::before': {
              backgroundColor: style.tokenSchema.color.background.accentEmphasis,
              borderRadius: style.tokenSchema.size.space.small,
              content: '""',
              insetBlock: style.tokenSchema.size.space.small,
              insetInlineStart: 0,
              position: 'absolute',
              width: style.tokenSchema.size.space.small
            }
          },
          [itemStyle('[aria-current=page][data-hovered] > &')]: {
            backgroundColor: style.tokenSchema.color.alias.backgroundPressed
          }
        }),
        style: {
          // @ts-expect-error
          '--inset': node.level + 1
        },
        children: [node.hasChildNodes ? /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: isRtl ? chevronLeftIcon.chevronLeftIcon : chevronRightIcon.chevronRightIcon,
          color: "neutralTertiary",
          UNSAFE_style: {
            transform: `rotate(${isExpanded ? isRtl ? -90 : 90 : 0}deg)`
          }
        }) : /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: dotIcon.dotIcon,
          color: "neutralTertiary"
        }), contents]
      })
    }), isExpanded && resolveTreeNodes({
      nodes: collections.getChildNodes(node, state.collection),
      state
    })]
  });
}
/**
 * Provides the behavior and accessibility implementation for an item within a tree.
 * @param props - Props for the tree item.
 * @param state - State of the parent list, as returned by `useTreeState`.
 * @param ref - The ref attached to the tree element.
 */
function useTreeItem(props, state, ref) {
  let {
    node,
    isVirtualized
  } = props;
  let {
    selectionManager
  } = state;
  let treeData = useTreeContext();
  let {
    direction
  } = i18n.useLocale();
  let isExpanded = state.expandedKeys.has(node.key);
  let isSelectedAncestor = treeData === null || treeData === void 0 ? void 0 : treeData.selectedAncestralKeys.includes(node.key);
  let onPress = e => {
    var _treeData$onAction;
    (_treeData$onAction = treeData.onAction) === null || _treeData$onAction === void 0 || _treeData$onAction.call(treeData, node.key);
    if (node.hasChildNodes) {
      // allow the user to alt+click to expand/collapse all descendants
      if (e.altKey) {
        let descendants = getDescendantNodes(node, state.collection);
        let newKeys = new Set(state.expandedKeys);
        for (let descendant of descendants) {
          if (isExpanded) {
            newKeys.delete(descendant.key);
          } else {
            newKeys.add(descendant.key);
          }
        }
        state.setExpandedKeys(newKeys);
      } else {
        state.toggleKey(node.key);
      }
    } else {
      var _treeData$onSelection;
      (_treeData$onSelection = treeData.onSelectionChange) === null || _treeData$onSelection === void 0 || _treeData$onSelection.call(treeData, node.key);
    }
  };
  let {
    itemProps: selectableItemProps,
    ...itemStates
  } = selection.useSelectableItem({
    key: node.key,
    selectionManager,
    ref,
    isVirtualized,
    // shouldUseVirtualFocus: true,
    shouldSelectOnPressUp: true
  });
  let {
    pressProps
  } = interactions.usePress({
    onPress,
    isDisabled: itemStates.isDisabled
  });
  let {
    isHovered,
    hoverProps
  } = interactions.useHover({
    isDisabled: itemStates.isDisabled
  });
  let onKeyDownCapture = e => {
    if (!ref.current || !e.currentTarget.contains(e.target)) {
      return;
    }
    let handleArrowBackward = () => {
      if (node.hasChildNodes && isExpanded) {
        if (e.altKey) {
          let expandedKeys = new Set(state.expandedKeys);
          for (let descendant of getDescendantNodes(node, state.collection)) {
            expandedKeys.delete(descendant.key);
          }
          state.setExpandedKeys(expandedKeys);
        } else {
          state.toggleKey(node.key);
        }
      } else if (node !== null && node !== void 0 && node.parentKey) {
        let parentNode = state.collection.getItem(node.parentKey);
        if ((parentNode === null || parentNode === void 0 ? void 0 : parentNode.type) === 'item') {
          selectionManager.setFocusedKey(node.parentKey);
        }
      }
    };
    let handleArrowForward = () => {
      if (node.hasChildNodes && !isExpanded) {
        if (e.altKey) {
          let expandedKeys = new Set(state.expandedKeys);
          for (let descendant of getDescendantNodes(node, state.collection)) {
            expandedKeys.add(descendant.key);
          }
          state.setExpandedKeys(expandedKeys);
        } else {
          state.toggleKey(node.key);
        }
      } else if (node.hasChildNodes) {
        let firstChild = state.collection.getKeyAfter(node.key);
        if (firstChild) {
          selectionManager.setFocusedKey(firstChild);
        }
      }
    };
    switch (e.key) {
      case 'ArrowLeft':
        {
          e.preventDefault();
          if (direction === 'rtl') {
            handleArrowForward();
          } else {
            handleArrowBackward();
          }
          break;
        }
      case 'ArrowRight':
        {
          e.preventDefault();
          if (direction === 'rtl') {
            handleArrowBackward();
          } else {
            handleArrowForward();
          }
          break;
        }
    }
  };
  let itemProps = {
    ...utils$1.mergeProps(selectableItemProps, pressProps, hoverProps),
    onKeyDownCapture,
    'aria-label': node.textValue || undefined,
    'aria-disabled': itemStates.isDisabled || undefined,
    'aria-level': node.level + 1,
    'aria-expanded': node.hasChildNodes ? isExpanded : undefined,
    'aria-current': itemStates.isSelected ? 'page' : undefined
  };
  if (isVirtualized) {
    var _state$collection$get;
    let index = Number((_state$collection$get = state.collection.getItem(node.key)) === null || _state$collection$get === void 0 ? void 0 : _state$collection$get.index);
    itemProps['aria-posinset'] = Number.isNaN(index) ? undefined : index + 1;
    itemProps['aria-setsize'] = collections.getItemCount(state.collection);
  }
  return {
    itemProps,
    ...itemStates,
    isExpanded: node.hasChildNodes && isExpanded,
    isSelectedAncestor,
    isHovered
  };
}

/** Get descendants that contain children, inclusive of the root node. */
function getDescendantNodes(node, collection, depth = Infinity) {
  const descendants = new Set();
  if (depth === 0 || !node.hasChildNodes) {
    return descendants;
  }
  descendants.add(node);
  for (let child of collections.getChildNodes(node, collection)) {
    const childDescendants = getDescendantNodes(child, collection, depth - 1);
    for (let descendant of childDescendants) {
      descendants.add(descendant);
    }
  }
  return descendants;
}
function getAncestors(collection, node) {
  let parents = [];
  while (((_node = node) === null || _node === void 0 ? void 0 : _node.parentKey) != null) {
    var _node;
    // @ts-expect-error if there's a `parentKey`, there's a parent...
    node = collection.getItem(node.parentKey);
    parents.unshift(node);
  }
  return parents;
}

Object.defineProperty(exports, 'Item', {
  enumerable: true,
  get: function () { return collections.Item; }
});
Object.defineProperty(exports, 'Section', {
  enumerable: true,
  get: function () { return collections.Section; }
});
exports.NavTree = NavTree;
