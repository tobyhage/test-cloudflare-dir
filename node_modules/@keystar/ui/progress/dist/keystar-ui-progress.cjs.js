'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var meter = require('@react-aria/meter');
var style = require('@keystar/ui/style');
var React = require('react');
var utils = require('@react-aria/utils');
var emery = require('emery');
var typography = require('@keystar/ui/typography');
var jsxRuntime = require('react/jsx-runtime');
var progress = require('@react-aria/progress');

/** @private Internal component shared between `Meter` and `ProgressBar`. */
const BarBase = /*#__PURE__*/React.forwardRef(function BarBase(props, forwardedRef) {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    label,
    barClassName,
    showValueLabel = !!label,
    isIndeterminate,
    barProps,
    labelProps,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...otherProps
  } = props;
  let styleProps = style.useStyleProps(otherProps);
  value = utils.clamp(value, minValue, maxValue);
  let barStyle = {};
  if (!isIndeterminate) {
    let percentage = (value - minValue) / (maxValue - minValue);
    barStyle.width = `${Math.round(percentage * 100)}%`;
  }
  emery.warning(!!(label || ariaLabel || ariaLabelledby), 'If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility.');
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ...barProps,
    ...styleProps,
    ref: forwardedRef,
    className: style.classNames(style.css({
      '--bar-fill': style.tokenSchema.color.background.accentEmphasis,
      alignItems: 'flex-start',
      display: 'inline-flex',
      gap: style.tokenSchema.size.space.regular,
      flexFlow: 'wrap',
      isolation: 'isolate',
      justifyContent: 'space-between',
      minWidth: 0,
      position: 'relative',
      verticalAlign: 'top',
      width: style.tokenSchema.size.alias.singleLineWidth
    }), barClassName, styleProps.className),
    children: [label && /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      ...labelProps,
      flex: true,
      children: label
    }), showValueLabel && barProps && /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
      flexShrink: 0,
      children: barProps['aria-valuetext']
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: style.css({
        backgroundColor: style.tokenSchema.color.border.muted,
        borderRadius: style.tokenSchema.size.radius.full,
        height: style.tokenSchema.size.space.regular,
        minWidth: 0,
        overflow: 'hidden',
        width: '100%',
        zIndex: '1'
      }),
      children: /*#__PURE__*/jsxRuntime.jsx("div", {
        ...style.toDataAttributes({
          indeterminate: isIndeterminate !== null && isIndeterminate !== void 0 ? isIndeterminate : undefined
        }),
        className: style.css({
          backgroundColor: 'var(--bar-fill)',
          height: style.tokenSchema.size.space.regular,
          transition: style.transition('width', {
            duration: 'regular'
          }),
          '&[data-indeterminate]': {
            animation: `${indeterminateLoopLtr} ${style.tokenSchema.animation.duration.long} ${style.tokenSchema.animation.easing.easeInOut} infinite`,
            willChange: 'transform',
            '[dir=rtl] &': {
              animationName: indeterminateLoopRtl
            }
          }
        }),
        style: barStyle
      })
    })]
  });
});
const indeterminateLoopLtr = style.keyframes({
  from: {
    transform: 'translate(-100%)'
  },
  to: {
    transform: 'translate(100%)'
  }
});
const indeterminateLoopRtl = style.keyframes({
  from: {
    transform: 'translate(100%)'
  },
  to: {
    transform: 'translate(-100%)'
  }
});

/**
 * Meters are visual representations of a quantity or an achievement. Their
 * progress is determined by user actions, rather than system actions.
 */
const Meter = /*#__PURE__*/React.forwardRef(function Meter(props, forwardedRef) {
  let {
    tone,
    ...otherProps
  } = props;
  const {
    meterProps,
    labelProps
  } = meter.useMeter(props);
  return /*#__PURE__*/jsxRuntime.jsx(BarBase, {
    ...otherProps,
    ref: forwardedRef,
    barClassName: style.css({
      '&[data-tone="positive"]': {
        '--bar-fill': style.tokenSchema.color.background.positiveEmphasis
      },
      '&[data-tone="caution"]': {
        '--bar-fill': style.tokenSchema.color.background.cautionEmphasis
      },
      '&[data-tone="critical"]': {
        '--bar-fill': style.tokenSchema.color.background.criticalEmphasis
      }
    }),
    barProps: {
      ...meterProps,
      ...style.toDataAttributes({
        tone
      })
    },
    labelProps: labelProps
  });
});

/**
 * ProgressBars show the progression of a system operation: downloading, uploading, processing, etc., in a visual way.
 * They can represent either determinate or indeterminate progress.
 */
const ProgressBar = /*#__PURE__*/React.forwardRef(function ProgressBar(props, forwardedRef) {
  const {
    progressBarProps,
    labelProps
  } = progress.useProgressBar(props);
  return /*#__PURE__*/jsxRuntime.jsx(BarBase, {
    ...props,
    ref: forwardedRef,
    barProps: progressBarProps,
    labelProps: labelProps
  });
});

/**
 * Progress circles show the progression of a system operation such as
 * downloading, uploading, processing, etc. in a visual way. They can represent
 * determinate or indeterminate progress.
 */
const ProgressCircle = /*#__PURE__*/React.forwardRef(function ProgressCircle(props, forwardRef) {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    size = 'medium',
    isIndeterminate,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...otherProps
  } = props;
  value = utils.clamp(value, minValue, maxValue);
  let {
    progressBarProps
  } = progress.useProgressBar({
    ...props,
    value
  });
  let styleProps = style.useStyleProps(otherProps);
  emery.warning(!!(ariaLabel || ariaLabelledby), 'ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility.');
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    ...styleProps,
    ...progressBarProps,
    ref: forwardRef,
    ...style.toDataAttributes({
      indeterminate: isIndeterminate !== null && isIndeterminate !== void 0 ? isIndeterminate : undefined,
      size: size === 'medium' ? undefined : size
    }),
    className: style.classNames(style.css({
      height: 'var(--diameter)',
      width: 'var(--diameter)',
      '--PI': 3.14159,
      '--diameter': style.tokenSchema.size.element.regular,
      '--radius': 'calc(var(--diameter) / 2)',
      '--stroke-width': style.tokenSchema.size.scale[40],
      // TODO: component tokent
      '--offset-radius': 'calc(var(--radius) - var(--stroke-width) / 2)',
      '--circumference': `calc(var(--offset-radius) * var(--PI) * 2)`,
      ['&[data-size=small]']: {
        '--diameter': style.tokenSchema.size.element.xsmall,
        '--stroke-width': style.tokenSchema.size.border.medium
      },
      ['&[data-size=large]']: {
        '--diameter': style.tokenSchema.size.element.xlarge,
        '--stroke-width': style.tokenSchema.size.border.large
      }
    }), styleProps.className),
    style: {
      // @ts-ignore
      '--percent': (value - minValue) / (maxValue - minValue),
      ...styleProps.style
    },
    children: /*#__PURE__*/jsxRuntime.jsxs("svg", {
      ...style.toDataAttributes({
        indeterminate: isIndeterminate !== null && isIndeterminate !== void 0 ? isIndeterminate : undefined
      }),
      role: "presentation",
      tabIndex: -1,
      className: style.css({
        height: 'var(--diameter)',
        width: 'var(--diameter)',
        '&[data-indeterminate]': {
          animation: `${rotateAnimation} ${style.tokenSchema.animation.duration.xlong} linear infinite`
        }
      }),
      children: [/*#__PURE__*/jsxRuntime.jsx("circle", {
        className: circle({
          stroke: style.tokenSchema.color.border.muted
        })
      }), /*#__PURE__*/jsxRuntime.jsx("circle", {
        ...style.toDataAttributes({
          indeterminate: isIndeterminate !== null && isIndeterminate !== void 0 ? isIndeterminate : undefined
        }),
        className: circle({
          stroke: style.tokenSchema.color.background.accentEmphasis,
          strokeDasharray: 'var(--circumference)',
          strokeLinecap: 'round',
          '&:not([data-indeterminate])': {
            strokeDashoffset: `calc(var(--circumference) - var(--percent) * var(--circumference))`,
            transition: style.transition('stroke-dashoffset', {
              duration: 'regular'
            }),
            transform: 'rotate(-90deg)',
            transformOrigin: 'center'
          },
          '&[data-indeterminate]': {
            animation: `${dashAnimation} ${style.tokenSchema.animation.duration.xlong} ${style.tokenSchema.animation.easing.easeInOut} infinite`
          }
        })
      })]
    })
  });
});

// Utils
// -----------------------------------------------------------------------------

function circle(styles) {
  return style.css([{
    cx: 'var(--radius)',
    cy: 'var(--radius)',
    r: 'var(--offset-radius)',
    fill: 'transparent',
    strokeWidth: 'var(--stroke-width)'
  }, styles]);
}
const rotateAnimation = style.keyframes({
  from: {
    transform: 'rotate(0deg)'
  },
  to: {
    transform: 'rotate(360deg)'
  }
});
const dashAnimation = style.keyframes({
  from: {
    strokeDashoffset: 'calc(var(--circumference) * 1.25)'
  },
  to: {
    strokeDashoffset: 'calc(var(--circumference) * -0.75)'
  }
});

exports.Meter = Meter;
exports.ProgressBar = ProgressBar;
exports.ProgressCircle = ProgressCircle;
