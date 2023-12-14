import { ReactNode } from 'react';
import { FlexStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type FlexProps = {
    children?: ReactNode;
} & FlexStyleProps;
/**
 * A layout container CSS flex. Keystar UI dimension values provide
 * consistent spacing between items.
 */
export declare const Flex: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<FlexProps, "div">;
