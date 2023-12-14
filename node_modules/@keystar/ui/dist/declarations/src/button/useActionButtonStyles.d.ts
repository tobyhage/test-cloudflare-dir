/// <reference types="react" />
import { ClassList } from "../../style/dist/keystar-ui-style.cjs.js";
import { ActionButtonProps } from "./types.js";
type ButtonState = {
    isHovered: boolean;
    isPressed: boolean;
    isSelected?: boolean;
};
export declare const actionButtonClassList: ClassList<"text" | "icon">;
export declare function useActionButtonStyles(props: ActionButtonProps, state: ButtonState): {
    style: import("react").CSSProperties | undefined;
    className: string;
};
export {};
