'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_url = require('node:url');
var path = require('node:path');
var fs = require('node:fs/promises');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefault(path);
var fs__default = /*#__PURE__*/_interopDefault(fs);

function keystatic() {
  return {
    name: 'keystatic',
    hooks: {
      'astro:config:setup': async ({
        injectRoute,
        updateConfig,
        config
      }) => {
        if (config.output !== 'hybrid') {
          throw new Error("Keystatic requires `output: 'hybrid'` in your Astro config");
        }
        const vite = {
          plugins: [{
            name: 'keystatic',
            resolveId(id) {
              if (id === 'virtual:keystatic-config') {
                return this.resolve('./keystatic.config', './a');
              }
              return null;
            }
          }],
          optimizeDeps: {
            entries: ['keystatic.config.*', '.astro/keystatic-imports.js']
          }
        };
        const dotAstroDir = path__default["default"].join(node_url.fileURLToPath(config.root), '.astro');
        await fs__default["default"].mkdir(dotAstroDir, {
          recursive: true
        });
        await fs__default["default"].writeFile(path__default["default"].join(dotAstroDir, 'keystatic-imports.js'), `import "@keystatic/astro/ui";
import "@keystatic/astro/api";
import "@keystatic/core/ui";
`);
        updateConfig({
          vite
        });
        injectRoute({
          entryPoint: '@keystatic/astro/internal/keystatic-astro-page.astro',
          pattern: '/keystatic/[...params]',
          prerender: false
        });
        injectRoute({
          entryPoint: '@keystatic/astro/internal/keystatic-api.js',
          pattern: '/api/keystatic/[...params]',
          prerender: false
        });
      }
    }
  };
}

exports["default"] = keystatic;
