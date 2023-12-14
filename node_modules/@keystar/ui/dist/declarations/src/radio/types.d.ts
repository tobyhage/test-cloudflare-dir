import { AriaRadioGroupProps, AriaRadioProps } from '@react-aria/radio';
import { ReactNode } from 'react';
import { FieldProps } from "../../field/dist/keystar-ui-field.cjs.js";
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type RadioProps = AriaRadioProps & BaseStyleProps;
export type RadioGroupProps = AriaRadioGroupProps & FieldProps & BaseStyleProps & {
    /** The radio buttons contained within the group. */
    children: ReactNode;
};
