import { AssetTypes } from '../../../types';
import APIHandler from './default';
declare const _default: { [key in AssetTypes]: {
    default: typeof APIHandler;
    excludeSchema?: any;
    schema: any;
    includeSchema?: any;
}; };
export default _default;
