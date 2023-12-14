import { jsxs, jsx } from 'react/jsx-runtime';

const scissorsIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 6,
    cy: 6,
    r: 3
  }), /*#__PURE__*/jsx("circle", {
    cx: 6,
    cy: 18,
    r: 3
  }), /*#__PURE__*/jsx("path", {
    d: "M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"
  })]
});

export { scissorsIcon };
