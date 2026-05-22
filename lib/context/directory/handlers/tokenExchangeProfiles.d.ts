import { DirectoryHandler } from '.';
import { Asset, ParsedAsset } from '../../../types';
type ParsedTokenExchangeProfiles = ParsedAsset<'tokenExchangeProfiles', Asset[]>;
declare const handler: DirectoryHandler<ParsedTokenExchangeProfiles>;
export default handler;
