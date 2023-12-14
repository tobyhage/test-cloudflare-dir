/// <reference types="react" />
import { FontSizeHeading } from "../../../style/dist/keystar-ui-style.cjs.js";
type HeadingContextType = {
    size: FontSizeHeading;
};
export declare const HeadingContext: import("react").Context<HeadingContextType | undefined>;
export declare function useHeadingContext(): HeadingContextType | undefined;
export {};
