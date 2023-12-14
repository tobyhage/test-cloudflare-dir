'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('react');
var ui = require('@keystatic/core/ui');
var jsxRuntime = require('react/jsx-runtime');

const appSlug = {
  envName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG',
  value: undefined.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
};
function makePage(config) {
  return function Keystatic() {
    return /*#__PURE__*/jsxRuntime.jsx(ui.Keystatic, {
      config: config,
      appSlug: appSlug
    });
  };
}

exports.makePage = makePage;
