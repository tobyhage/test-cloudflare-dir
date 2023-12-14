import { DOMProps } from '@react-types/shared';
import { ForwardRefExoticComponent, ReactNode, Ref } from 'react';
import { BaseStyleProps, BoxAlignmentStyleProps, BoxStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type ScrollDirection = 'vertical' | 'horizontal';
export type ScrollIndicator = 'start' | 'end' | 'both' | 'none';
export type ScrollViewProps = {
    /** The content of the scroll view. */
    children?: ReactNode;
    /**
     * Which direction to allow scroll.
     * @default 'vertical'
     */
    direction?: ScrollDirection;
} & BoxAlignmentStyleProps & Omit<BoxStyleProps, 'display'> & DOMProps & BaseStyleProps;
export declare const ScrollView: ForwardRefExoticComponent<ScrollViewProps & {
    ref?: Ref<HTMLDivElement>;
}>;
