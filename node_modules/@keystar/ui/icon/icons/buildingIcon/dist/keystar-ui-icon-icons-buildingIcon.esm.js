import { jsxs, jsx } from 'react/jsx-runtime';

const buildingIcon = /*#__PURE__*/jsxs("svg", {
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
  }), /*#__PURE__*/jsx("path", {
    d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"
  })]
});

export { buildingIcon };
