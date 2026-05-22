import { DirectoryHandler } from '.';
import { Asset, ParsedAsset } from '../../../types';
type ParsedTenant = ParsedAsset<'tenant', Asset>;
declare const tenantHandler: DirectoryHandler<ParsedTenant>;
export default tenantHandler;
