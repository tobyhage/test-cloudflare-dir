import { ReactNode } from 'react';
import { GridStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type GridProps = {
    children?: ReactNode;
} & GridStyleProps;
/**
 * A layout container using CSS grid. Keystar UI dimension values provide
 * consistent sizing and spacing.
 */
export declare const Grid: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<GridProps, "div">;
