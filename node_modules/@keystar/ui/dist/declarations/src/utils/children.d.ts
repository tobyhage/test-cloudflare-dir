/// <reference types="react" />
export declare function useHasChild(query: string, ref: React.RefObject<HTMLElement>): boolean;
export declare function cloneValidElement<Props>(child: React.ReactElement<Props> | React.ReactNode, props?: Partial<Props> & React.Attributes): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | null;
