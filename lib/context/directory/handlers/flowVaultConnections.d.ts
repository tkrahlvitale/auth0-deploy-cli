import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { FlowVaultConnection } from '../../../tools/auth0/handlers/flowVaultConnections';
type ParsedFlowVaults = ParsedAsset<'flowVaultConnections', FlowVaultConnection[]>;
declare const flowVaultsHandler: DirectoryHandler<ParsedFlowVaults>;
export default flowVaultsHandler;
