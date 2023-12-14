import { AriaLabelingProps, DOMProps, Orientation } from '@react-types/shared';
import { BaseStyleProps, SizeBorder } from "../../style/dist/keystar-ui-style.cjs.js";
export type DividerProps = {
    /**
     * The axis the Divider should align with.
     * @default 'horizontal'
     */
    orientation?: Orientation;
    /**
     * How thick the Divider should be.
     * @default 'regular'
     */
    size?: SizeBorder;
    /**
     * A slot to place the divider in.
     * @default 'divider'
     */
    slot?: string;
} & AriaLabelingProps & DOMProps & BaseStyleProps;
