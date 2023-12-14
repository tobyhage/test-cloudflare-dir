'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var style = require('@keystar/ui/style');
var core = require('@keystar/ui/core');
var navigation = require('next/navigation');
var React = require('react');
var useRootColorScheme = require('./useRootColorScheme-7bff500e.cjs.js');
var jsxRuntime = require('react/jsx-runtime');

style.cache.compat = true;
function NextRootProvider(props) {
  return /*#__PURE__*/jsxRuntime.jsx(useRootColorScheme.ColorSchemeProvider, {
    children: /*#__PURE__*/jsxRuntime.jsx(InnerProvider, {
      ...props
    })
  });
}
const insertedKeys = Object.keys(style.cache.inserted);
const prevInsert = style.cache.insert;
style.cache.insert = (...args) => {
  const serialized = args[1];
  if (style.cache.inserted[serialized.name] === undefined) {
    insertedKeys.push(serialized.name);
  }
  return prevInsert(...args);
};
function InnerProvider(props) {
  let lastIndexRef = React.useRef(0);
  let {
    colorScheme
  } = useRootColorScheme.useRootColorScheme();
  navigation.useServerInsertedHTML(() => {
    const names = insertedKeys.slice(lastIndexRef.current);
    lastIndexRef.current = insertedKeys.length;
    if (names.length === 0) return null;
    let styles = '';
    for (const name of names) {
      styles += style.cache.inserted[name];
    }
    return /*#__PURE__*/jsxRuntime.jsx("style", {
      "data-emotion": `${style.cache.key} ${names.join(' ')}`,
      dangerouslySetInnerHTML: {
        __html: styles
      }
    }, Math.random().toString(36));
  });
  const {
    push: navigate
  } = navigation.useRouter();
  const router = React.useMemo(() => {
    return {
      navigate
    };
  }, [navigate]);
  return /*#__PURE__*/jsxRuntime.jsx(core.KeystarProvider, {
    ...props,
    UNSAFE_className: props.fontClassName,
    colorScheme: colorScheme,
    elementType: "html",
    router: router
  });
}

exports.NextRootProvider = NextRootProvider;
