import { jsxs, jsx } from 'react/jsx-runtime';

const chromeIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 12,
    r: 10
  }), /*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 12,
    r: 4
  }), /*#__PURE__*/jsx("path", {
    d: "M21.17 8H12M3.95 6.06 8.54 14M10.88 21.94 15.46 14"
  })]
});

export { chromeIcon };
