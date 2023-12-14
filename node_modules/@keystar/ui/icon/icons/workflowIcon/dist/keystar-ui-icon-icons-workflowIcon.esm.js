import { jsxs, jsx } from 'react/jsx-runtime';

const workflowIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 8,
    height: 8,
    x: 3,
    y: 3,
    rx: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M7 11v4a2 2 0 0 0 2 2h4"
  }), /*#__PURE__*/jsx("rect", {
    width: 8,
    height: 8,
    x: 13,
    y: 13,
    rx: 2
  })]
});

export { workflowIcon };
