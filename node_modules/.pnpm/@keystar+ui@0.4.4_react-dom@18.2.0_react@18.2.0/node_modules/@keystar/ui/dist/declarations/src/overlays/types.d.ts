import { AriaModalOverlayProps, AriaPopoverProps } from '@react-aria/overlays';
import { OverlayTriggerState } from '@react-stately/overlays';
import { OverlayProps } from '@react-types/overlays';
import { HTMLAttributes, ReactNode } from 'react';
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type BlanketProps = {
    isOpen?: boolean;
    isTransparent?: boolean;
} & BaseStyleProps & HTMLAttributes<HTMLDivElement>;
export type PopoverProps = Omit<AriaPopoverProps, 'popoverRef' | 'maxHeight'> & {
    children: ReactNode;
    hideArrow?: boolean;
    state: OverlayTriggerState;
} & BaseStyleProps;
export type ModalProps = {
    children: ReactNode;
    state: OverlayTriggerState;
    type?: 'modal' | 'fullscreen';
} & AriaModalOverlayProps & BaseStyleProps & Omit<OverlayProps, 'nodeRef'>;
export type TrayProps = {
    children: ReactNode;
    state: OverlayTriggerState;
    isFixedHeight?: boolean;
} & AriaModalOverlayProps & BaseStyleProps & Omit<OverlayProps, 'nodeRef'>;
