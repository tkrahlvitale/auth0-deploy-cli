import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { ActionModule } from '../../../tools/auth0/handlers/actionModules';
type ParsedActionModules = ParsedAsset<'actionModules', Partial<ActionModule>[]>;
declare const ActionModulesHandler: YAMLHandler<ParsedActionModules>;
export default ActionModulesHandler;
