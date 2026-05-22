import { DirectoryHandler } from '.';
import { Asset, ParsedAsset } from '../../../types';
type ParsedActionModules = ParsedAsset<'actionModules', Asset[]>;
declare const actionModulesHandler: DirectoryHandler<ParsedActionModules>;
export default actionModulesHandler;
