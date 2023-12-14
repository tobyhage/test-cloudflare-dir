'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var date = require('@internationalized/date');
var calendar = require('@react-aria/calendar');
var i18n = require('@react-aria/i18n');
var utils = require('@react-aria/utils');
var calendar$1 = require('@react-stately/calendar');
var React = require('react');
var core = require('@keystar/ui/core');
var visuallyHidden = require('@react-aria/visually-hidden');
var button = require('@keystar/ui/button');
var icon = require('@keystar/ui/icon');
var chevronLeftIcon = require('@keystar/ui/icon/icons/chevronLeftIcon');
var chevronRightIcon = require('@keystar/ui/icon/icons/chevronRightIcon');
var style = require('@keystar/ui/style');
var typography = require('@keystar/ui/typography');
var focus = require('@react-aria/focus');
var interactions = require('@react-aria/interactions');
var jsxRuntime = require('react/jsx-runtime');

function CalendarCell({
  currentMonth,
  state,
  ...props
}) {
  let ref = React.useRef(null);
  let {
    buttonProps,
    cellProps,
    formattedDate,
    isDisabled,
    isFocused,
    isInvalid,
    isPressed,
    isSelected
  } = calendar.useCalendarCell({
    ...props,
    isDisabled: !date.isSameMonth(props.date, currentMonth)
  }, state, ref);
  let isUnavailable = state.isCellUnavailable(props.date) && !isDisabled;
  let isLastSelectedBeforeDisabled = !isDisabled && !isInvalid && state.isCellUnavailable(props.date.add({
    days: 1
  }));
  let isFirstSelectedAfterDisabled = !isDisabled && !isInvalid && state.isCellUnavailable(props.date.subtract({
    days: 1
  }));
  let highlightedRange = 'highlightedRange' in state && state.highlightedRange;
  let isSelectionStart = isSelected && highlightedRange && date.isSameDay(props.date, highlightedRange.start);
  let isSelectionEnd = isSelected && highlightedRange && date.isSameDay(props.date, highlightedRange.end);
  let {
    locale
  } = i18n.useLocale();
  let dayOfWeek = date.getDayOfWeek(props.date, locale);
  let isRangeStart = isSelected && (isFirstSelectedAfterDisabled || dayOfWeek === 0 || props.date.day === 1);
  let isRangeEnd = isSelected && (isLastSelectedBeforeDisabled || dayOfWeek === 6 || props.date.day === currentMonth.calendar.getDaysInMonth(currentMonth));
  let {
    focusProps,
    isFocusVisible
  } = focus.useFocusRing();
  let {
    hoverProps,
    isHovered
  } = interactions.useHover({
    isDisabled: isDisabled || isUnavailable || state.isReadOnly
  });
  let dayState = {
    // Style disabled (i.e. out of min/max range), but selected dates as unavailable
    // since it is more clear than trying to dim the selection.
    isDisabled: isDisabled && !isInvalid,
    isFocused: isFocused && isFocusVisible,
    isHovered: isHovered,
    isInvalid: isInvalid,
    isOutsideMonth: !date.isSameMonth(props.date, currentMonth),
    isPressed: isPressed && !state.isReadOnly,
    isRangeEnd: isRangeEnd,
    isRangeSelection: isSelected && 'highlightedRange' in state,
    isRangeStart: isRangeStart,
    isSelected: isSelected,
    isSelectionEnd: isSelectionEnd,
    isSelectionStart: isSelectionStart,
    isToday: date.isToday(props.date, state.timeZone),
    isUnavailable: isUnavailable || isInvalid && isDisabled
  };
  let cellStyleProps = useCellStyles(dayState);
  let dayStyleProps = useDayStyles(dayState);
  return /*#__PURE__*/jsxRuntime.jsx("td", {
    ...cellStyleProps,
    ...cellProps,
    children: /*#__PURE__*/jsxRuntime.jsx("span", {
      ref: ref,
      ...utils.mergeProps(buttonProps, hoverProps, focusProps),
      ...dayStyleProps,
      children: /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
        align: "center",
        color: "inherit",
        trim: false,
        weight: "inherit",
        children: formattedDate
      })
    })
  });
}
function useCellStyles(props = {}) {
  let cellSize = `var(--calendar-cell-width, ${style.tokenSchema.size.element.regular})`;
  let cellPadding = `var(--calendar-cell-padding, ${style.tokenSchema.size.space.xsmall})`;
  return {
    ...style.toDataAttributes(props, {
      omitFalsyValues: true,
      trimBooleanKeys: true
    }),
    className: style.css({
      height: cellSize,
      padding: cellPadding,
      position: 'relative',
      textAlign: 'center',
      width: cellSize,
      '&[data-range-selection]:not([data-outside-month])': {
        backgroundColor: style.tokenSchema.color.alias.backgroundSelected,
        '&[data-invalid]': {
          backgroundColor: style.tokenSchema.color.background.critical,
          color: style.tokenSchema.color.foreground.critical
        }
      },
      '&[data-selection-start], &[data-range-start]': {
        borderStartStartRadius: style.tokenSchema.size.radius.full,
        borderEndStartRadius: style.tokenSchema.size.radius.full
      },
      '&[data-selection-end], &[data-range-end]': {
        borderStartEndRadius: style.tokenSchema.size.radius.full,
        borderEndEndRadius: style.tokenSchema.size.radius.full
      }
    })
  };
}
function useDayStyles(props) {
  let className = style.css({
    alignItems: 'center',
    borderRadius: style.tokenSchema.size.radius.full,
    color: style.tokenSchema.color.foreground.neutral,
    cursor: 'default',
    display: 'flex',
    inset: style.tokenSchema.size.space.xsmall,
    justifyContent: 'center',
    outline: 0,
    position: 'absolute',
    // Date specific
    // -------------------------------------------------------------------------

    // hide dates from other months
    '&[data-outside-month]': {
      visibility: 'hidden'
    },
    // today — indicated by a small underline beneath the date
    '&[data-today]': {
      color: style.tokenSchema.color.foreground.accent,
      fontWeight: style.tokenSchema.typography.fontWeight.semibold,
      '&:not([data-unavailable])::before': {
        backgroundColor: 'currentColor',
        borderRadius: style.tokenSchema.size.radius.full,
        content: '""',
        height: style.tokenSchema.size.border.medium,
        marginInline: 'auto',
        position: 'absolute',
        top: `calc(50% + 1ch)`,
        width: '2ch'
      }
    },
    // unavailable — indicated by an angled strike-through over the date
    '&[data-unavailable]:not([data-selected])': {
      '::before': {
        backgroundColor: 'currentColor',
        borderRadius: style.tokenSchema.size.radius.full,
        content: '""',
        height: style.tokenSchema.size.border.medium,
        marginInline: 'auto',
        position: 'absolute',
        top: '50%',
        insetInline: style.tokenSchema.size.space.small,
        transform: 'rotate(-16deg)'
      }
    },
    // Interaction states
    // -------------------------------------------------------------------------

    '&[data-hovered]': {
      backgroundColor: style.tokenSchema.color.alias.backgroundHovered,
      color: style.tokenSchema.color.alias.foregroundHovered
    },
    '&[data-pressed]': {
      backgroundColor: style.tokenSchema.color.alias.backgroundPressed
    },
    '&[data-focused]': {
      outline: `${style.tokenSchema.size.alias.focusRing} solid ${style.tokenSchema.color.alias.focusRing}`,
      outlineOffset: style.tokenSchema.size.alias.focusRingGap
    },
    // Selection states
    // -------------------------------------------------------------------------

    '&[data-disabled]': {
      color: style.tokenSchema.color.alias.foregroundDisabled
    },
    '&[data-selected]:not([data-range-selection], [data-disabled]), &[data-selection-start], &[data-selection-end]': {
      backgroundColor: style.tokenSchema.color.background.accentEmphasis,
      color: style.tokenSchema.color.foreground.onEmphasis,
      '&[data-invalid]': {
        backgroundColor: style.tokenSchema.color.background.criticalEmphasis
      }
    },
    '&[data-range-selection]:not([data-selection-start], [data-selection-end])': {
      color: style.tokenSchema.color.foreground.accent,
      '&[data-hovered]': {
        backgroundColor: style.tokenSchema.color.alias.backgroundSelectedHovered
      },
      '&[data-invalid]': {
        color: style.tokenSchema.color.foreground.critical
      }
    }
  });
  return {
    ...style.toDataAttributes(props, {
      omitFalsyValues: true,
      trimBooleanKeys: true
    }),
    className
  };
}

function CalendarMonth(props) {
  let {
    state,
    startDate
  } = props;
  let {
    gridProps,
    headerProps,
    weekDays
  } = calendar.useCalendarGrid({
    ...props,
    endDate: date.endOfMonth(startDate)
  }, state);
  let {
    locale
  } = i18n.useLocale();
  let weeksInMonth = date.getWeeksInMonth(startDate, locale);
  let cellStyleProps = useCellStyles();
  return /*#__PURE__*/jsxRuntime.jsxs("table", {
    className: style.css({
      borderCollapse: 'collapse',
      borderSpacing: 0,
      tableLayout: 'fixed',
      userSelect: 'none',
      width: 'var(--calendar-width)'
    }),
    ...gridProps,
    children: [/*#__PURE__*/jsxRuntime.jsx("thead", {
      ...headerProps,
      children: /*#__PURE__*/jsxRuntime.jsx("tr", {
        children: weekDays.map((day, index) => /*#__PURE__*/jsxRuntime.jsx("th", {
          ...cellStyleProps,
          children: /*#__PURE__*/jsxRuntime.jsx(typography.Text, {
            align: "center",
            color: "neutralTertiary",
            size: "small",
            children: day
          })
        }, index))
      })
    }), /*#__PURE__*/jsxRuntime.jsx("tbody", {
      children: [...new Array(weeksInMonth).keys()].map(weekIndex => /*#__PURE__*/jsxRuntime.jsx("tr", {
        children: state.getDatesInWeek(weekIndex, startDate).map((date, i) => date ? /*#__PURE__*/jsxRuntime.jsx(CalendarCell, {
          state: state,
          date: date,
          currentMonth: startDate
        }, i) : /*#__PURE__*/jsxRuntime.jsx("td", {}, i))
      }, weekIndex))
    })]
  });
}

function CalendarBase(props) {
  let {
    state,
    calendarProps,
    nextButtonProps,
    prevButtonProps,
    calendarRef: ref,
    visibleMonths = 1
  } = props;
  let styleProps = useCalendarStyles(props);
  let {
    direction
  } = i18n.useLocale();
  let currentMonth = state.visibleRange.start;
  let monthDateFormatter = i18n.useDateFormatter({
    month: 'long',
    year: 'numeric',
    era: currentMonth.calendar.identifier === 'gregory' && currentMonth.era === 'BC' ? 'short' : undefined,
    calendar: currentMonth.calendar.identifier,
    timeZone: state.timeZone
  });
  let titles = [];
  let calendars = [];
  for (let i = 0; i < visibleMonths; i++) {
    let d = currentMonth.add({
      months: i
    });
    titles.push( /*#__PURE__*/jsxRuntime.jsxs("div", {
      ...styleProps.monthHeader,
      children: [i === 0 && /*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
        ...prevButtonProps,
        prominence: "low",
        gridArea: "prev",
        justifySelf: "start",
        UNSAFE_style: {
          padding: 0
        },
        children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: direction === 'rtl' ? chevronRightIcon.chevronRightIcon : chevronLeftIcon.chevronLeftIcon,
          size: "medium"
        })
      }), /*#__PURE__*/jsxRuntime.jsx(typography.Heading, {
        gridArea: "title",
        elementType: "h2",
        size: "small",
        align: "center"
        // We have a visually hidden heading describing the entire visible range,
        // and the calendar itself describes the individual month
        // so we don't need to repeat that here for screen reader users.
        ,
        "aria-hidden": true,
        children: monthDateFormatter.format(d.toDate(state.timeZone))
      }), i === visibleMonths - 1 && /*#__PURE__*/jsxRuntime.jsx(button.ActionButton, {
        ...nextButtonProps,
        prominence: "low",
        gridArea: "next",
        justifySelf: "end",
        UNSAFE_style: {
          padding: 0
        },
        children: /*#__PURE__*/jsxRuntime.jsx(icon.Icon, {
          src: direction === 'rtl' ? chevronLeftIcon.chevronLeftIcon : chevronRightIcon.chevronRightIcon,
          size: "medium"
        })
      })]
    }, i));
    calendars.push( /*#__PURE__*/React.createElement(CalendarMonth, {
      ...props,
      key: i,
      state: state,
      startDate: d
    }));
  }
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ...styleProps.root,
    ...calendarProps,
    ref: ref,
    children: [/*#__PURE__*/jsxRuntime.jsx(visuallyHidden.VisuallyHidden, {
      elementType: "h2",
      children: calendarProps['aria-label']
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      ...styleProps.titles,
      children: titles
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      ...styleProps.calendars,
      children: calendars
    }), /*#__PURE__*/jsxRuntime.jsx(visuallyHidden.VisuallyHidden, {
      children: /*#__PURE__*/jsxRuntime.jsx("button", {
        "aria-label": nextButtonProps['aria-label'],
        disabled: nextButtonProps.isDisabled,
        onClick: () => state.focusNextPage(),
        tabIndex: -1
      })
    })]
  });
}
function useCalendarStyles(props) {
  let styleProps = style.useStyleProps(props);
  let root = {
    ...styleProps,
    className: style.classNames(style.css({
      boxSizing: 'border-box',
      maxWidth: '100%',
      overflow: 'auto',
      // make space for the focus ring, so it doesn't get cropped
      padding: `calc(${style.tokenSchema.size.alias.focusRing} + ${style.tokenSchema.size.alias.focusRingGap})`,
      '--calendar-cell-width': style.tokenSchema.size.element.regular,
      '--calendar-cell-padding': style.tokenSchema.size.space.xsmall,
      '--calendar-width': 'calc(var(--calendar-cell-width) * 7 + var(--calendar-cell-padding) * 12)'
    }), styleProps.className)
  };
  let titles = {
    className: style.css({
      boxSizing: 'border-box',
      display: 'grid',
      gap: style.tokenSchema.size.space.large,
      gridAutoColumns: '1fr',
      gridAutoFlow: 'column',
      paddingInline: 'var(--calendar-cell-padding)',
      width: '100%'
    })
  };
  let calendars = {
    className: style.css({
      display: 'grid',
      gridAutoColumns: '1fr',
      gridAutoFlow: 'column',
      alignItems: 'start',
      gap: style.tokenSchema.size.space.large
    })
  };
  let monthHeader = {
    className: style.css({
      alignItems: 'center',
      display: 'grid',
      gridTemplateAreas: `"prev title next"`,
      gridTemplateColumns: 'minmax(auto, 1fr) auto minmax(auto, 1fr)',
      width: 'var(--calendar-width)'
    })
  };
  return {
    calendars,
    monthHeader,
    root,
    titles
  };
}

function Calendar(props, forwardedRef) {
  props = core.useProviderProps(props);
  let {
    visibleMonths = 1
  } = props;
  visibleMonths = Math.max(visibleMonths, 1);
  let visibleDuration = React.useMemo(() => ({
    months: visibleMonths
  }), [visibleMonths]);
  let {
    locale
  } = i18n.useLocale();
  let state = calendar$1.useCalendarState({
    ...props,
    locale,
    visibleDuration,
    createCalendar: date.createCalendar
  });
  let domRef = utils.useObjectRef(forwardedRef);
  React.useImperativeHandle(forwardedRef, () => ({
    ...domRef.current,
    focus() {
      state.setFocused(true);
    }
  }));
  let {
    calendarProps,
    prevButtonProps,
    nextButtonProps
  } = calendar.useCalendar(props, state);
  return /*#__PURE__*/jsxRuntime.jsx(CalendarBase, {
    ...props,
    visibleMonths: visibleMonths,
    state: state,
    calendarRef: domRef,
    calendarProps: calendarProps,
    prevButtonProps: prevButtonProps,
    nextButtonProps: nextButtonProps
  });
}

/**
 * Calendars display a grid of days in one or more months and allow users to
 * select a single date.
 */
const _Calendar = /*#__PURE__*/React.forwardRef(Calendar);

function RangeCalendar(props, forwardedRef) {
  props = core.useProviderProps(props);
  let {
    visibleMonths = 1
  } = props;
  visibleMonths = Math.max(visibleMonths, 1);
  let visibleDuration = React.useMemo(() => ({
    months: visibleMonths
  }), [visibleMonths]);
  let {
    locale
  } = i18n.useLocale();
  let state = calendar$1.useRangeCalendarState({
    ...props,
    locale,
    visibleDuration,
    createCalendar: date.createCalendar
  });
  let domRef = utils.useObjectRef(forwardedRef);
  React.useImperativeHandle(forwardedRef, () => ({
    ...domRef.current,
    focus() {
      state.setFocused(true);
    }
  }));
  let {
    calendarProps,
    prevButtonProps,
    nextButtonProps
  } = calendar.useRangeCalendar(props, state, domRef);
  return /*#__PURE__*/jsxRuntime.jsx(CalendarBase, {
    ...props,
    visibleMonths: visibleMonths,
    state: state,
    calendarRef: domRef,
    calendarProps: calendarProps,
    prevButtonProps: prevButtonProps,
    nextButtonProps: nextButtonProps
  });
}

/**
 * RangeCalendars display a grid of days in one or more months and allow users
 * to select a contiguous range of dates.
 */
const _RangeCalendar = /*#__PURE__*/React.forwardRef(RangeCalendar);

exports.Calendar = _Calendar;
exports.RangeCalendar = _RangeCalendar;
