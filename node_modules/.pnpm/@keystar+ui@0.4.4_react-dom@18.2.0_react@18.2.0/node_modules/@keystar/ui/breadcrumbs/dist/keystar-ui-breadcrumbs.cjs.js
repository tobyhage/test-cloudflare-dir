'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var collections = require('@react-stately/collections');
var breadcrumbs = require('@react-aria/breadcrumbs');
var utils = require('@react-aria/utils');
var emery = require('emery');
var React = require('react');
var button = require('@keystar/ui/button');
var core = require('@keystar/ui/core');
var icon = require('@keystar/ui/icon');
var folderClosedIcon = require('@keystar/ui/icon/icons/folderClosedIcon');
var folderOpenIcon = require('@keystar/ui/icon/icons/folderOpenIcon');
var menu = require('@keystar/ui/menu');
var style = require('@keystar/ui/style');
var i18n = require('@react-aria/i18n');
var interactions = require('@react-aria/interactions');
var chevronRightIcon = require('@keystar/ui/icon/icons/chevronRightIcon');
var chevronLeftIcon = require('@keystar/ui/icon/icons/chevronLeftIcon');
var jsxRuntime = require('react/jsx-runtime');

const breadcrumbsClassList = new style.ClassList('Breadcrumbs', ['item', 'link', 'list', 'separator']);
function BreadcrumbItem(props) {
  let {
    children,
    isCurrent,
    isDisabled,
    size = 'regular'
  } = props;
  let {
    direction
  } = i18n.useLocale();
  let ref = React.useRef(null);
  let {
    itemProps
  } = breadcrumbs.useBreadcrumbItem({
    ...props,
    elementType: 'span'
  }, ref);
  let {
    hoverProps,
    isHovered
  } = interactions.useHover(props);
  let icon$1 = React.useMemo(() => {
    return direction === 'rtl' ? chevronLeftIcon.chevronLeftIcon : chevronRightIcon.chevronRightIcon;
  }, [direction]);
  return /*#__PURE__*/jsxRuntime.jsxs(React.Fragment, {
    children: [/*#__PURE__*/jsxRuntime.jsx(style.FocusRing, {
      children: /*#__PURE__*/jsxRuntime.jsx("span", {
        ...utils.mergeProps(itemProps, hoverProps),
        ...style.toDataAttributes({
          size: size !== 'regular' ? size : undefined,
          interaction: isHovered ? 'hover' : undefined
        }),
        ref: ref,
        className: style.classNames(breadcrumbsClassList.element('link'), style.css({
          color: style.tokenSchema.color.foreground.neutral,
          cursor: 'default',
          fontSize: style.tokenSchema.typography.text.regular.size,
          fontFamily: style.tokenSchema.typography.fontFamily.base,
          fontWeight: style.tokenSchema.typography.fontWeight.medium,
          MozOsxFontSmoothing: 'auto',
          WebkitFontSmoothing: 'auto',
          '&[data-size=small]': {
            fontSize: style.tokenSchema.typography.text.small.size
          },
          '&[data-size=medium]': {
            fontSize: style.tokenSchema.typography.text.medium.size
          },
          '&[data-size=large]': {
            fontSize: style.tokenSchema.typography.text.large.size
          },
          '&:not([aria-current=page])': {
            '&:not([aria-disabled=true])': {
              cursor: 'pointer'
            },
            '&[data-interaction=hover]': {
              color: style.tokenSchema.color.foreground.neutralEmphasis,
              textDecoration: 'underline'
            },
            '&[aria-disabled=true]': {
              color: style.tokenSchema.color.alias.foregroundDisabled
            }
          },
          '&[aria-current=page]': {
            color: style.tokenSchema.color.foreground.neutralEmphasis,
            fontWeight: style.tokenSchema.typography.fontWeight.semibold,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }), {
          'is-hovered': isHovered
        }),
        children: children
      })
    }), !isCurrent && /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
      src: icon$1,
      color: isDisabled ? 'color.alias.foregroundDisabled' : 'neutralSecondary',
      marginX: "small",
      UNSAFE_className: breadcrumbsClassList.element('separator')
    })]
  });
}

const MIN_VISIBLE_ITEMS = 1;
const MAX_VISIBLE_ITEMS = 4;
function Breadcrumbs(props, ref) {
  props = core.useProviderProps(props);
  let {
    children,
    showRoot,
    size = 'regular',
    isDisabled,
    onAction,
    ...otherProps
  } = props;

  // Not using React.Children.toArray because it mutates the key prop.
  let childArray = [];
  React.Children.forEach(children, child => {
    if ( /*#__PURE__*/React.isValidElement(child)) {
      childArray.push(child);
    }
  });
  let domRef = utils.useObjectRef(ref);
  let listRef = React.useRef(null);
  let [menuIsOpen, setMenuOpen] = React.useState(false);
  let [visibleItems, setVisibleItems] = utils.useValueEffect(childArray.length);
  let {
    navProps
  } = breadcrumbs.useBreadcrumbs(props);
  let styleProps = style.useStyleProps(otherProps);
  let updateOverflow = React.useCallback(() => {
    let computeVisibleItems = visibleItems => {
      let currListRef = listRef.current;
      if (!currListRef) {
        return;
      }
      let listItems = Array.from(currListRef.children);
      let containerWidth = currListRef.offsetWidth;
      let isShowingMenu = childArray.length > visibleItems;
      let calculatedWidth = 0;
      let newVisibleItems = 0;
      let maxVisibleItems = MAX_VISIBLE_ITEMS;
      if (showRoot) {
        let el = listItems.shift();
        if (el) {
          calculatedWidth += el.offsetWidth;
          newVisibleItems++;
        }
      }
      if (isShowingMenu) {
        let el = listItems.shift();
        if (el) {
          calculatedWidth += el.offsetWidth;
          maxVisibleItems--;
        }
      }
      if (showRoot && calculatedWidth >= containerWidth) {
        newVisibleItems--;
      }
      if (listItems.length > 0) {
        // Ensure the last breadcrumb isn't truncated when we measure it.
        let last = listItems.pop();
        if (last) {
          last.style.overflow = 'visible';
          calculatedWidth += last.offsetWidth;
          if (calculatedWidth < containerWidth) {
            newVisibleItems++;
          }
          last.style.overflow = '';
        }
      }
      for (let breadcrumb of listItems.reverse()) {
        calculatedWidth += breadcrumb.offsetWidth;
        if (calculatedWidth < containerWidth) {
          newVisibleItems++;
        }
      }
      return Math.max(MIN_VISIBLE_ITEMS, Math.min(maxVisibleItems, newVisibleItems));
    };
    setVisibleItems(function* () {
      // Update to show all items.
      yield childArray.length;

      // Measure, and update to show the items that fit.
      let newVisibleItems = computeVisibleItems(childArray.length);
      yield newVisibleItems;

      // If the number of items is less than the number of children,
      // then update again to ensure that the menu fits.
      if (emery.isNumber(newVisibleItems) && newVisibleItems < childArray.length && newVisibleItems > 1) {
        yield computeVisibleItems(newVisibleItems);
      }
    });
  }, [childArray.length, setVisibleItems, showRoot]);
  utils.useResizeObserver({
    ref: domRef,
    onResize: updateOverflow
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  utils.useLayoutEffect(updateOverflow, [children]);
  let contents = childArray;
  if (childArray.length > visibleItems) {
    var _selectedItem$key;
    let selectedItem = childArray[childArray.length - 1];
    let selectedKey = (_selectedItem$key = selectedItem.key) !== null && _selectedItem$key !== void 0 ? _selectedItem$key : childArray.length - 1;
    let onMenuAction = key => {
      // Don't fire onAction when clicking on the last item
      if (key !== selectedKey && onAction) {
        onAction(key);
      }
    };
    let menuItem = /*#__PURE__*/jsxRuntime.jsx(BreadcrumbItem, {
      children: /*#__PURE__*/jsxRuntime.jsxs(menu.MenuTrigger, {
        onOpenChange: setMenuOpen,
        children: [/*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
          "aria-label": "\u2026",
          prominence: "low",
          isDisabled: isDisabled,
          children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
            src: menuIsOpen ? folderOpenIcon.folderOpenIcon : folderClosedIcon.folderClosedIcon
          })
        }), /*#__PURE__*/jsxRuntime.jsx(menu.Menu, {
          selectionMode: "single",
          selectedKeys: [selectedKey],
          onAction: onMenuAction,
          children: childArray
        })]
      })
    }, "menu");
    contents = [menuItem];
    let breadcrumbs = [...childArray];
    let endItems = visibleItems;
    if (showRoot && visibleItems > 1) {
      let el = breadcrumbs.shift();
      if (el) {
        contents.unshift(el);
        endItems--;
      }
    }
    contents.push(...breadcrumbs.slice(-endItems));
  }
  let lastIndex = contents.length - 1;
  let breadcrumbItems = contents.map((child, index) => {
    var _child$key;
    let isCurrent = index === lastIndex;
    let key = (_child$key = child.key) !== null && _child$key !== void 0 ? _child$key : index;
    let onPress = () => {
      if (onAction) {
        onAction(key);
      }
    };
    return /*#__PURE__*/jsxRuntime.jsx("li", {
      className: style.classNames(breadcrumbsClassList.element('item'), style.css({
        alignItems: 'center',
        display: 'inline-flex',
        whiteSpace: 'nowrap',
        '&:last-child': {
          overflow: 'hidden'
        }
      })),
      children: /*#__PURE__*/jsxRuntime.jsx(BreadcrumbItem, {
        isCurrent: isCurrent,
        isDisabled: isDisabled,
        onPress: onPress,
        size: size,
        children: child.props.children
      }, key)
    }, index);
  });
  return /*#__PURE__*/jsxRuntime.jsx("nav", {
    ...navProps,
    ...styleProps,
    ref: domRef,
    className: style.classNames(breadcrumbsClassList.element('root'), styleProps.className),
    children: /*#__PURE__*/jsxRuntime.jsx("ul", {
      ref: listRef,
      className: style.classNames(breadcrumbsClassList.element('list'), style.css({
        display: 'flex',
        height: style.tokenSchema.size.element.regular,
        justifyContent: 'flex-start'
      })),
      children: breadcrumbItems
    })
  });
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref

/**
 * Breadcrumbs show hierarchy and navigational context for a user's location
 * within an application.
 */
const _Breadcrumbs = /*#__PURE__*/React.forwardRef(Breadcrumbs);

Object.defineProperty(exports, 'Item', {
  enumerable: true,
  get: function () { return collections.Item; }
});
exports.Breadcrumbs = _Breadcrumbs;
