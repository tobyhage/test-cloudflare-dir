import { jsxs, jsx } from 'react/jsx-runtime';

const zoomInIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 11,
    cy: 11,
    r: 8
  }), /*#__PURE__*/jsx("path", {
    d: "m21 21-4.35-4.35M11 8v6M8 11h6"
  })]
});

export { zoomInIcon };
