/// <reference types="react" />
import { ClassList } from "../../style/dist/keystar-ui-style.cjs.js";
import { ButtonProps } from "./types.js";
type ButtonState = {
    isHovered: boolean;
    isPressed: boolean;
    isSelected?: boolean;
};
export declare const buttonClassList: ClassList<"text" | "icon">;
export declare function useButtonStyles(props: ButtonProps, state: ButtonState): {
    style: import("react").CSSProperties | undefined;
    className: string;
};
export {};
