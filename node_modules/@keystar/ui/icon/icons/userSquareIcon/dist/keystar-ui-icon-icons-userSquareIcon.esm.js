import { jsxs, jsx } from 'react/jsx-runtime';

const userSquareIcon = /*#__PURE__*/jsxs("svg", {
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
    y: 3,
    rx: 2
  }), /*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 10,
    r: 3
  }), /*#__PURE__*/jsx("path", {
    d: "M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
  })]
});

export { userSquareIcon };
