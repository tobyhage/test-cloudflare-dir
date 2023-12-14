import { DOMProps } from '@react-types/shared';
import { ReactNode } from 'react';
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
type ContentProps = {
    /**
     * The content element(s).
     */
    children: ReactNode;
} & BaseStyleProps & DOMProps;
/** A block of content within a container. */
export declare const Content: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<ContentProps, "section">;
export {};
