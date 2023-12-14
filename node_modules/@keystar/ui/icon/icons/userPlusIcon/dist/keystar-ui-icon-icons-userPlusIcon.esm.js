import { jsxs, jsx } from 'react/jsx-runtime';

const userPlusIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/jsx("circle", {
    cx: 9,
    cy: 7,
    r: 4
  }), /*#__PURE__*/jsx("path", {
    d: "M19 8v6M22 11h-6"
  })]
});

export { userPlusIcon };
