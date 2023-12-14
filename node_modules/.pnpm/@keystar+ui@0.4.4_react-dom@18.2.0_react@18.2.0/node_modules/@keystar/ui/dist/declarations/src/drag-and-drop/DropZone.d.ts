import { DropOptions } from '@react-aria/dnd';
import { AriaLabelingProps, DOMProps } from '@react-types/shared';
import { BaseStyleProps, ClassList } from "../../style/dist/keystar-ui-style.cjs.js";
import { WithRenderProps } from "../../types/dist/keystar-ui-types.cjs.js";
export type DropZoneProps = Omit<DropOptions, 'getDropOperationForPoint' | 'ref' | 'hasDropButton'> & WithRenderProps<{
    isDropTarget: boolean;
}> & BaseStyleProps & DOMProps & AriaLabelingProps;
export declare const dropZoneClassList: ClassList<(string & {}) | "root">;
/**
 * A DropZone is an area into which one or multiple objects can be dragged and
 * dropped.
 */
export declare const DropZone: import("../../utils/ts/dist/keystar-ui-utils-ts.cjs.js").CompWithAsProp<DropZoneProps, "div">;
