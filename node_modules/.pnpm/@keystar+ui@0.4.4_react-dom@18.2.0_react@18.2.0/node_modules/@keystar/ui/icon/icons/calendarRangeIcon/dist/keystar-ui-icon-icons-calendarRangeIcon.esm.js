import { jsxs, jsx } from 'react/jsx-runtime';

const calendarRangeIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 18,
    height: 18,
    x: 3,
    y: 4,
    rx: 2,
    ry: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M16 2v4M8 2v4M3 10h18M17 14h-6M13 18H7M7 14h.01M17 18h.01"
  })]
});

export { calendarRangeIcon };
