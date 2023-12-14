import { SpectrumPickerProps } from '@react-types/select';
import { ActionButtonProps } from "../../button/dist/keystar-ui-button.cjs.js";
import { FieldProps } from "../../field/dist/keystar-ui-field.cjs.js";
import { BaseStyleProps } from "../../style/dist/keystar-ui-style.cjs.js";
export type PickerProps<T> = {
    /**
     * Alignment of the menu, relative to the picker. Only relevant when
     * used in combination with the `menuWidth` prop.
     * @default 'start'
     */
    align?: 'start' | 'end';
    /** Whether the element should receive focus on render. */
    autoFocus?: boolean;
    /**
     * Direction the menu will render relative to the picker.
     * @default 'bottom'
     */
    direction?: 'bottom' | 'top';
    /**
     * A fixed width for the menu. By default, the menu will match the
     * width of the picker. Values less than the width of the picker are ignored.
     */
    menuWidth?: number;
    /**
     * Whether the menu should automatically flip direction when space is limited.
     * @default true
     */
    shouldFlip?: boolean;
} & SpectrumPickerProps<T> & FieldProps & Pick<ActionButtonProps, 'prominence'> & BaseStyleProps;
