import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { Flow } from '../../../tools/auth0/handlers/flows';
type ParsedFlows = ParsedAsset<'flows', Flow[]>;
declare const flowsHandler: DirectoryHandler<ParsedFlows>;
export default flowsHandler;
