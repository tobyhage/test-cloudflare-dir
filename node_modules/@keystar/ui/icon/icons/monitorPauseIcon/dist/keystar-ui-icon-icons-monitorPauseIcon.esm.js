import { jsxs, jsx } from 'react/jsx-runtime';

const monitorPauseIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("path", {
    d: "M10 13V7M14 13V7"
  }), /*#__PURE__*/jsx("rect", {
    width: 20,
    height: 14,
    x: 2,
    y: 3,
    rx: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M12 17v4M8 21h8"
  })]
});

export { monitorPauseIcon };
