import { ClassList } from "../../../style/dist/keystar-ui-style.cjs.js";
import { HeadingProps, PartialRequired } from "../../../types/dist/keystar-ui-types.cjs.js";
export declare const headingClassList: ClassList<(string & {}) | "root">;
export declare function useHeadingStyles({ align, size, UNSAFE_className, ...otherProps }: PartialRequired<HeadingProps, 'size'>): Pick<import("react").HTMLAttributes<HTMLElement>, "style" | "className">;
