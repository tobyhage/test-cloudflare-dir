import { PropsWithChildren } from 'react';
import { ColorScheme } from "../../types/dist/keystar-ui-types.cjs.js";
export declare const ColorSchemeProvider: ({ children }: PropsWithChildren) => import("react").JSX.Element;
export declare function useRootColorScheme(): {
    colorScheme: ColorScheme;
    setColorScheme: (colorScheme: ColorScheme) => void;
};
