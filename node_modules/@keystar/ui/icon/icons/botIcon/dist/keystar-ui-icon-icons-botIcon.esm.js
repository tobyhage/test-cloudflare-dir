import { jsxs, jsx } from 'react/jsx-runtime';

const botIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 18,
    height: 10,
    x: 3,
    y: 11,
    rx: 2
  }), /*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 5,
    r: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M12 7v4M8 16h0M16 16h0"
  })]
});

export { botIcon };
