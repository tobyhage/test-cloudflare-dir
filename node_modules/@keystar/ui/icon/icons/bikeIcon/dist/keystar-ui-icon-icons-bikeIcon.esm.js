import { jsxs, jsx } from 'react/jsx-runtime';

const bikeIcon = /*#__PURE__*/jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  children: [/*#__PURE__*/jsx("circle", {
    cx: 18.5,
    cy: 17.5,
    r: 3.5
  }), /*#__PURE__*/jsx("circle", {
    cx: 5.5,
    cy: 17.5,
    r: 3.5
  }), /*#__PURE__*/jsx("circle", {
    cx: 15,
    cy: 5,
    r: 1
  }), /*#__PURE__*/jsx("path", {
    d: "M12 17.5V14l-3-3 4-3 2 3h2"
  })]
});

export { bikeIcon };
