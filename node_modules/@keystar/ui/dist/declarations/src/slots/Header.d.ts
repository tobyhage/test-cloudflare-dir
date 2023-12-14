import { DOMProps } from '@react-types/shared';
import { ReactNode } from 'react';
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
type HeaderProps = {
    /**
     * The header element(s).
     */
    children: ReactNode;
} & BaseStyleProps & DOMProps;
/** A header within a container. */
export declare const Header: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<HeaderProps, "header">;
export {};
