import { VoussoirTheme } from "../../style/dist/keystar-ui-style.cjs.js";
import { ColorScheme } from "../../types/dist/keystar-ui-types.cjs.js";
type StrictBackground = keyof VoussoirTheme['color']['background'];
export declare const documentElementClasses: (args: {
    bodyBackground?: StrictBackground;
    colorScheme?: ColorScheme;
}) => string;
export {};
