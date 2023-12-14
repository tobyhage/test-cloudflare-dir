import { ReactNode } from 'react';
import { FlexStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type StackProps = {
    children?: ReactNode;
} & Omit<FlexStyleProps, 'direction' | 'inline' | 'wrap'>;
/** A thin wrapper around `Flex`, for stacking elements vertically. */
export declare const VStack: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<StackProps, "div">;
/** A thin wrapper around `Flex`, for stacking elements horizontally. */
export declare const HStack: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<StackProps, "div">;
