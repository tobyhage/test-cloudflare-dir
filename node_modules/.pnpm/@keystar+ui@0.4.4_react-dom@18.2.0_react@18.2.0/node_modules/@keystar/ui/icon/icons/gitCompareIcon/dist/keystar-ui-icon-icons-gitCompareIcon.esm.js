import { jsxs, jsx } from 'react/jsx-runtime';

const gitCompareIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 18,
    cy: 18,
    r: 3
  }), /*#__PURE__*/jsx("circle", {
    cx: 6,
    cy: 6,
    r: 3
  }), /*#__PURE__*/jsx("path", {
    d: "M13 6h3a2 2 0 0 1 2 2v7M11 18H8a2 2 0 0 1-2-2V9"
  })]
});

export { gitCompareIcon };
