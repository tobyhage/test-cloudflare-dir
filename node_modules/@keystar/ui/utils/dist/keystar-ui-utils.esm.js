import { useLayoutEffect } from '@react-aria/utils';
import React, { useState, isValidElement, cloneElement, useRef, useEffect, useCallback } from 'react';

// TODO: replace instances of this with CSS `:has()` when it's supported
// https://developer.mozilla.org/en-US/docs/Web/CSS/:has
// https://caniuse.com/#feat=css-has
// https://bugzilla.mozilla.org/show_bug.cgi?id=418039
function useHasChild(query, ref) {
  let [hasChild, setHasChild] = useState(true);
  useLayoutEffect(() => {
    setHasChild(!!(ref.current && ref.current.querySelector(query)));
  }, [setHasChild, query, ref]);
  return hasChild;
}
function cloneValidElement(child, props) {
  if (! /*#__PURE__*/isValidElement(child)) {
    return null;
  }
  return /*#__PURE__*/cloneElement(child, props);
}

/**
 * Format IDs for compound components.
 *
 * @example
 * const root = useId()
 * const inputId = composeId(root, 'input') // => ':R1:--input'
 * const descriptionId = composeId(root, 'field-element' 'description') // => ':R1:--field-element--description'
 */
function composeId(...args) {
  return args.filter(Boolean).join('--');
}

function isReactText(value) {
  if (Array.isArray(value)) {
    return value.every(isReactText);
  }
  return typeof value === 'string' || typeof value === 'number';
}

/**
 * A thin wrapper around `React.useId()` that supports a consumer provided ID.
 */
function useId(id) {
  let generatedId = React.useId();
  return id || generatedId;
}

/**
 * Returns a function that returns `true` if the component is mounted, and
 * `false` otherwise.
 */
function useIsMounted() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return useCallback(() => isMounted.current, []);
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useRenderProps(props, values) {
  if (typeof props.children === 'function') {
    return props.children(values);
  } else {
    return props.children;
  }
}

export { cloneValidElement, composeId, isReactText, useHasChild, useId, useIsMounted, usePrevious, useRenderProps };
