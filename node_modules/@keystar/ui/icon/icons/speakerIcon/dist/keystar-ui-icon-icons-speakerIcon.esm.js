import { jsxs, jsx } from 'react/jsx-runtime';

const speakerIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 16,
    height: 20,
    x: 4,
    y: 2,
    rx: 2,
    ry: 2
  }), /*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 14,
    r: 4
  }), /*#__PURE__*/jsx("path", {
    d: "M12 6h.01"
  })]
});

export { speakerIcon };
