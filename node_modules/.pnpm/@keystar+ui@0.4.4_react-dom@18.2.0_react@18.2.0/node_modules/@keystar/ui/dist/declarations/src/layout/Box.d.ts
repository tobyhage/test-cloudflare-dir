import { ReactNode } from 'react';
import { DOMProps } from '@react-types/shared';
import { BoxStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type BoxProps = {
    children?: ReactNode;
} & DOMProps & BoxStyleProps;
/** Exposes a prop-based API for adding styles to a view, within the constraints of the theme. */
export declare const Box: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<BoxProps, "div">;
