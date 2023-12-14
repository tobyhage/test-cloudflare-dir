'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@react-aria/utils');
var React = require('react');
var jsxRuntime = require('react/jsx-runtime');
var style = require('@keystar/ui/style');
var ts = require('@keystar/ui/utils/ts');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

let SlotContext = /*#__PURE__*/React__default["default"].createContext({});

/**
 * Merge component props with ancestral slot props. With the exception of "id",
 * consumer props are overriden by slot props, while event handlers will be
 * chained so all are called.
 */
function useSlotProps(props, defaultSlot) {
  let slot = props.slot || defaultSlot;
  let {
    [slot]: slotProps = {}
  } = React.useContext(SlotContext);
  return utils.mergeProps(props, utils.mergeProps(slotProps, {
    id: props.id
  }));
}

/**
 * Not really "slots" like web components, more like "prop portalling" or
 * something. Default and override the props of descendent components.
 *
 * @example
 * <SlotProvider slots={{ text: { size: 'small' } }}>
 *   {children}
 * </SlotProvider>
 */
const SlotProvider = props => {
  let {
    children,
    slots
  } = props;
  let parentSlots = React.useContext(SlotContext);

  // Merge props for each slot from parent context and props
  let value = React.useMemo(() => Object.keys(parentSlots).concat(Object.keys(slots)).reduce((obj, key) => ({
    ...obj,
    [key]: utils.mergeProps(parentSlots[key], slots[key])
  }), {}), [parentSlots, slots]);
  return /*#__PURE__*/jsxRuntime.jsx(SlotContext.Provider, {
    value: value,
    children: children
  });
};

// MAYBE: "preserve" some props?
// e.g. <ClearSlots preserve={{ slotName: true }} />
const ClearSlots = ({
  children
}) => {
  return /*#__PURE__*/jsxRuntime.jsx(SlotContext.Provider, {
    value: {},
    children: children
  });
};

/** A block of content within a container. */
const Content = ts.forwardRefWithAs((props, ref) => {
  props = useSlotProps(props, 'content');
  let {
    elementType: Element = 'section',
    children,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  return /*#__PURE__*/jsxRuntime.jsx(Element, {
    ...utils.filterDOMProps(otherProps),
    ...styleProps,
    ref: ref,
    children: children
  });
});

/** A footer within a container. */
const Footer = ts.forwardRefWithAs((props, ref) => {
  props = useSlotProps(props, 'footer');
  let {
    elementType: Element = 'footer',
    children,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  return /*#__PURE__*/jsxRuntime.jsx(Element, {
    ...utils.filterDOMProps(otherProps),
    ...styleProps,
    ref: ref,
    children: children
  });
});

/** A header within a container. */
const Header = ts.forwardRefWithAs((props, ref) => {
  props = useSlotProps(props, 'header');
  let {
    elementType: Element = 'header',
    children,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  return /*#__PURE__*/jsxRuntime.jsx(Element, {
    ...utils.filterDOMProps(otherProps),
    ...styleProps,
    ref: ref,
    children: children
  });
});

exports.ClearSlots = ClearSlots;
exports.Content = Content;
exports.Footer = Footer;
exports.Header = Header;
exports.SlotProvider = SlotProvider;
exports.useSlotProps = useSlotProps;
