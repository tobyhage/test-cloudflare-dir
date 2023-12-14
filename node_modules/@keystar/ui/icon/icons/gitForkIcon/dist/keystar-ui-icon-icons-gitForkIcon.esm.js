import { jsxs, jsx } from 'react/jsx-runtime';

const gitForkIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 18,
    r: 3
  }), /*#__PURE__*/jsx("circle", {
    cx: 6,
    cy: 6,
    r: 3
  }), /*#__PURE__*/jsx("circle", {
    cx: 18,
    cy: 6,
    r: 3
  }), /*#__PURE__*/jsx("path", {
    d: "M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9M12 12v3"
  })]
});

export { gitForkIcon };
