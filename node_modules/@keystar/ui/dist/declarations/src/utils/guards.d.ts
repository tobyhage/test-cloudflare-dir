type ReactText = string | number;
type MaybeArray<T> = T | T[];
export declare function isReactText(value: unknown): value is MaybeArray<ReactText>;
export {};
