import { jsxs, jsx } from 'react/jsx-runtime';

const touchpadIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("rect", {
    width: 20,
    height: 16,
    x: 2,
    y: 4,
    rx: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M2 14h20M12 20v-6"
  })]
});

export { touchpadIcon };
