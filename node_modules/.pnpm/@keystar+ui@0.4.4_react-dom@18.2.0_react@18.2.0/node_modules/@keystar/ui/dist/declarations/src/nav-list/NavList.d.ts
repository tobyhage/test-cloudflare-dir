import { AriaLabelingProps, DOMProps } from '@react-types/shared';
import { ReactNode, ForwardRefExoticComponent, Ref } from 'react';
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type NavListProps = {
    children: ReactNode;
} & BaseStyleProps & DOMProps & AriaLabelingProps;
/** Navigation lists let users navigate the application. */
export declare const NavList: ForwardRefExoticComponent<NavListProps & {
    ref?: Ref<HTMLDivElement>;
}>;
