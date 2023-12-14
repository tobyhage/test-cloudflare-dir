import { jsxs, jsx } from 'react/jsx-runtime';

const alignHorizontalSpaceBetweenIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 6,
    height: 14,
    x: 3,
    y: 5,
    rx: 2
  }), /*#__PURE__*/jsx("rect", {
    width: 6,
    height: 10,
    x: 15,
    y: 7,
    rx: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M3 2v20M21 2v20"
  })]
});

export { alignHorizontalSpaceBetweenIcon };
