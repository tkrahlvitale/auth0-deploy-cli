import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { FlowVaultConnection } from '../../../tools/auth0/handlers/flowVaultConnections';
type ParsedParsedFlowVaults = ParsedAsset<'flowVaultConnections', FlowVaultConnection[]>;
declare const pagesHandler: YAMLHandler<ParsedParsedFlowVaults>;
export default pagesHandler;
