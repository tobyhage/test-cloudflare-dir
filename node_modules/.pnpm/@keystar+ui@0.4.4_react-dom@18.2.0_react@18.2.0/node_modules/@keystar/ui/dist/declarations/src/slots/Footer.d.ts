import { DOMProps } from '@react-types/shared';
import { ReactNode } from 'react';
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
type FooterProps = {
    /**
     * The footer element(s).
     */
    children: ReactNode;
} & BaseStyleProps & DOMProps;
/** A footer within a container. */
export declare const Footer: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<FooterProps, "footer">;
export {};
