'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tooltip = require('@react-aria/tooltip');
var utils = require('@react-aria/utils');
var React = require('react');
var overlays$1 = require('@keystar/ui/overlays');
var slots = require('@keystar/ui/slots');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var utils$1 = require('@keystar/ui/utils');
var overlays = require('@react-aria/overlays');
var jsxRuntime = require('react/jsx-runtime');
var focus = require('@react-aria/focus');
var tooltip$1 = require('@react-stately/tooltip');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const TooltipContext = /*#__PURE__*/React__default["default"].createContext({});

const Tooltip = /*#__PURE__*/React.forwardRef(function Tooltip(props, forwardedRef) {
  let {
    state,
    targetRef: triggerRef,
    overlayRef: tooltipRef,
    crossOffset,
    offset,
    ...contextualProps
  } = React.useContext(TooltipContext);
  props = utils.mergeProps(props, contextualProps);
  let {
    isOpen,
    tone,
    ...otherProps
  } = props;
  let targetGapToken = style.tokenSchema.size.space.regular;
  let {
    tooltipProps
  } = tooltip.useTooltip(contextualProps, state);
  let styleProps = style.useStyleProps(otherProps);
  let ref = React.useRef(null);
  let overlayRef = utils.useObjectRef(tooltipRef ? utils.mergeRefs(tooltipRef, forwardedRef) : forwardedRef); // for testing etc. tooltips may be rendered w/o a trigger
  let targetRef = triggerRef !== null && triggerRef !== void 0 ? triggerRef : ref; // for testing etc. tooltips may be rendered w/o a trigger

  let slots$1 = React.useMemo(() => ({
    icon: {
      size: 'small',
      color: 'inherit'
    },
    text: {
      size: 'small',
      color: 'inherit'
    },
    kbd: {
      size: 'small',
      color: 'inherit'
    }
  }), []);
  let preferredPlacement = contextualProps.placement || 'top';
  let {
    overlayProps,
    arrowProps,
    placement: resolvedPlacement
  } = overlays.useOverlayPosition({
    ...contextualProps,
    placement: preferredPlacement,
    isOpen: state === null || state === void 0 ? void 0 : state.isOpen,
    overlayRef,
    targetRef
  });
  let placement = (resolvedPlacement || preferredPlacement).split(' ')[0];
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ...utils.mergeProps(overlayProps, tooltipProps),
    ...utils.filterDOMProps(otherProps),
    ...style.toDataAttributes({
      placement,
      tone,
      open: isOpen || undefined
    }),
    ref: overlayRef,
    className: style.classNames(style.css({
      backgroundColor: style.tokenSchema.color.background.inverse,
      color: style.tokenSchema.color.foreground.inverse,
      borderRadius: style.tokenSchema.size.radius.small,
      maxWidth: style.tokenSchema.size.alias.singleLineWidth,
      minHeight: style.tokenSchema.size.element.small,
      paddingBlock: style.tokenSchema.size.space.regular,
      paddingInline: style.tokenSchema.size.space.regular,
      opacity: 0,
      pointerEvents: 'none',
      transition: style.transition(['opacity', 'transform']),
      userSelect: 'none',
      '&[data-tone="accent"]': {
        backgroundColor: style.tokenSchema.color.background.accentEmphasis,
        color: style.tokenSchema.color.foreground.onEmphasis
      },
      '&[data-tone="critical"]': {
        backgroundColor: style.tokenSchema.color.background.criticalEmphasis,
        color: style.tokenSchema.color.foreground.onEmphasis
      },
      '&[data-tone="positive"]': {
        backgroundColor: style.tokenSchema.color.background.positiveEmphasis,
        color: style.tokenSchema.color.foreground.onEmphasis
      },
      // animate towards placement, away from the trigger
      '&[data-placement="top"]': {
        marginBottom: targetGapToken,
        transform: `translateY(calc(${targetGapToken} * 0.5))`
      },
      '&[data-placement="bottom"]': {
        marginTop: targetGapToken,
        transform: `translateY(calc(${targetGapToken} * -0.5))`
      },
      '&[data-placement="left"], [dir=ltr] &[data-placement="start"], [dir=rtl] &[data-placement="end"]': {
        marginRight: targetGapToken,
        transform: `translateX(calc(${targetGapToken} * 0.5))`
      },
      '&[data-placement="right"], [dir=ltr] &[data-placement="end"], [dir=rtl] &[data-placement="start"]': {
        marginLeft: targetGapToken,
        transform: `translateX(calc(${targetGapToken} * -0.5))`
      },
      '&[data-open="true"]': {
        opacity: 1,
        transform: `translate(0)`
      }
    }), styleProps.className),
    style: {
      ...overlayProps.style,
      ...tooltipProps.style,
      ...styleProps.style
    },
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      className: style.css({
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        gap: style.tokenSchema.size.space.small
      }),
      children: /*#__PURE__*/jsxRuntime.jsx(slots.SlotProvider, {
        slots: slots$1,
        children: props.children && (utils$1.isReactText(props.children) ? /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
          children: props.children
        }) : props.children)
      })
    }), /*#__PURE__*/jsxRuntime.jsx(overlays$1.DirectionIndicator, {
      ...arrowProps,
      fill: toneToFill[tone !== null && tone !== void 0 ? tone : 'neutral'],
      placement: placement,
      size: "xsmall"
    })]
  });
});
const toneToFill = {
  accent: 'accent',
  critical: 'critical',
  neutral: 'inverse',
  positive: 'positive'
};

const MOUSE_REST_TIMEOUT = 600;
function TooltipTrigger(props) {
  let {
    children,
    isDisabled,
    trigger: triggerMode,
    ...otherProps
  } = props;
  let targetRef = React.useRef(null);
  let overlayRef = React.useRef(null);
  let state = tooltip$1.useTooltipTriggerState({
    isDisabled,
    delay: MOUSE_REST_TIMEOUT,
    trigger: triggerMode,
    ...props
  });
  let {
    triggerProps,
    tooltipProps
  } = tooltip.useTooltipTrigger({
    isDisabled,
    trigger: triggerMode
  }, state, targetRef);
  let [triggerElement, tooltipElement] = React__default["default"].Children.toArray(children);
  return /*#__PURE__*/jsxRuntime.jsxs(focus.FocusableProvider, {
    ...triggerProps,
    ref: targetRef,
    children: [triggerElement, /*#__PURE__*/jsxRuntime.jsx(TooltipContext.Provider, {
      value: {
        overlayRef,
        targetRef,
        state,
        ...otherProps,
        ...tooltipProps
      },
      children: /*#__PURE__*/jsxRuntime.jsx(overlays$1.Overlay, {
        isOpen: state.isOpen,
        nodeRef: overlayRef,
        children: tooltipElement
      })
    })]
  });
}

// Support TooltipTrigger inside components using CollectionBuilder.
TooltipTrigger.getCollectionNode = function* (props) {
  // Children.toArray mutates the key prop, use Children.forEach instead.
  let childArray = [];
  React__default["default"].Children.forEach(props.children, child => {
    if ( /*#__PURE__*/React__default["default"].isValidElement(child)) {
      childArray.push(child);
    }
  });
  let [trigger, tooltip] = childArray;
  yield {
    element: trigger,
    wrapper: element => /*#__PURE__*/jsxRuntime.jsxs(TooltipTrigger, {
      ...props,
      children: [element, tooltip]
    }, element.key)
  };
};

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing
 * the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip
 * relative to the trigger.
 */
// We don't want getCollectionNode to show up in the type definition
let _TooltipTrigger = TooltipTrigger;

exports.Tooltip = Tooltip;
exports.TooltipTrigger = _TooltipTrigger;
