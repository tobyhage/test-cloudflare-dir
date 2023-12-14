import { jsxs, jsx } from 'react/jsx-runtime';

const locateFixedIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("path", {
    d: "M2 12h3M19 12h3M12 2v3M12 19v3"
  }), /*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 12,
    r: 7
  }), /*#__PURE__*/jsx("circle", {
    cx: 12,
    cy: 12,
    r: 3
  })]
});

export { locateFixedIcon };
