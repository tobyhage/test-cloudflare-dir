import { jsxs, jsx } from 'react/jsx-runtime';

const databaseIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("ellipse", {
    cx: 12,
    cy: 5,
    rx: 9,
    ry: 3
  }), /*#__PURE__*/jsx("path", {
    d: "M3 5v14a9 3 0 0 0 18 0V5"
  }), /*#__PURE__*/jsx("path", {
    d: "M3 12a9 3 0 0 0 18 0"
  })]
});

export { databaseIcon };
