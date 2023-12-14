/// <reference types="react" />
/** Search fields are text fields, specifically designed for search behaviour. */
export declare const SearchField: import("react").ForwardRefExoticComponent<{
    onSubmit?: ((value: string) => void) | undefined;
    onClear?: (() => void) | undefined;
    showIcon?: boolean | undefined;
} & Omit<import("../../text-field/dist/keystar-ui-text-field.cjs.js").TextFieldProps, "pattern" | "type"> & import("react").RefAttributes<HTMLInputElement>>;
