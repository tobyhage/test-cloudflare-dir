import { jsxs, jsx } from 'react/jsx-runtime';

const alignVerticalSpaceBetweenIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 14,
    height: 6,
    x: 5,
    y: 15,
    rx: 2
  }), /*#__PURE__*/jsx("rect", {
    width: 10,
    height: 6,
    x: 7,
    y: 3,
    rx: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M2 21h20M2 3h20"
  })]
});

export { alignVerticalSpaceBetweenIcon };
