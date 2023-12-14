'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var jsxRuntime = require('react/jsx-runtime');

const ColorSchemeContext = /*#__PURE__*/React.createContext({
  colorScheme: 'light',
  setColorScheme: () => {
    throw new Error('ColorSchemeContext was not initialized.');
  }
});
const ColorSchemeProvider = ({
  children
}) => {
  const value = useColorSchemeState();
  return /*#__PURE__*/jsxRuntime.jsx(ColorSchemeContext.Provider, {
    value: value,
    children: children
  });
};
function useRootColorScheme() {
  return React.useContext(ColorSchemeContext);
}
const STORAGE_KEY = 'keystatic-root-color-scheme';

/** @private only for initializing the provider */
function useColorSchemeState() {
  let storedPreference = useStoredColorScheme();
  let [colorScheme, setStoredValue] = React.useState(storedPreference);
  let setColorScheme = colorScheme => {
    localStorage.setItem(STORAGE_KEY, colorScheme);
    setStoredValue(colorScheme);
  };

  // fix for renamed value: "system" --> "auto"
  // remove after a month or so: ~2023-10-01
  React.useEffect(() => {
    // @ts-expect-error
    if (colorScheme === 'system') {
      setColorScheme('auto');
    }
  }, [colorScheme]);
  return {
    colorScheme,
    setColorScheme
  };
}
const useStoredColorScheme = typeof window === 'undefined' ? function useStoredColorScheme() {
  return 'auto';
} : function useStoredColorScheme() {
  return useLocalStorageValue(STORAGE_KEY);
};
function useLocalStorageValue(key) {
  let [value, setValue] = React.useState(() => localStorage[key]);
  React.useEffect(() => {
    const handler = () => {
      setValue(localStorage[key]);
    };
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [key]);
  return value;
}

exports.ColorSchemeProvider = ColorSchemeProvider;
exports.useRootColorScheme = useRootColorScheme;
