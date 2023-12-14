/// <reference types="react" />
import { TextProps } from "../../../types/dist/keystar-ui-types.cjs.js";
export type TextContextType = Pick<TextProps, 'color' | 'size' | 'weight'>;
export declare const TextContext: import("react").Context<TextContextType | undefined>;
export declare function useTextContext(): TextContextType | undefined;
