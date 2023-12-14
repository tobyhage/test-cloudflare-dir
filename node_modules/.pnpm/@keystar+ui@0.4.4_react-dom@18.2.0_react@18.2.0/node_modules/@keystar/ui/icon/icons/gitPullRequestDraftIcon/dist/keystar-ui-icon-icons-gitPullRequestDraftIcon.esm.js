import { jsxs, jsx } from 'react/jsx-runtime';

const gitPullRequestDraftIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 18,
    cy: 18,
    r: 3
  }), /*#__PURE__*/jsx("circle", {
    cx: 6,
    cy: 6,
    r: 3
  }), /*#__PURE__*/jsx("path", {
    d: "M18 6V5M18 11v-1M6 9v12"
  })]
});

export { gitPullRequestDraftIcon };
