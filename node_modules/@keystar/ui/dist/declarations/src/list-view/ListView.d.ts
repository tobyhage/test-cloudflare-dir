import React, { ReactElement, RefObject } from 'react';
import { ListViewProps } from "./types.js";
/**
 * Displays a list of interactive items, and allows a user to navigate, select,
 * or perform an action.
 */
declare const _ListView: <T>(props: ListViewProps<T> & {
    ref?: React.RefObject<HTMLDivElement> | undefined;
}) => ReactElement;
export { _ListView as ListView };
