import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { Flow } from '../../../tools/auth0/handlers/flows';
type ParsedFlows = ParsedAsset<'flows', Flow[]>;
declare const pagesHandler: YAMLHandler<ParsedFlows>;
export default pagesHandler;
