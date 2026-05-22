import { YAMLHandler } from '.';
import { Asset, ParsedAsset } from '../../../types';
type ParsedTokenExchangeProfiles = ParsedAsset<'tokenExchangeProfiles', Asset[]>;
declare const handler: YAMLHandler<ParsedTokenExchangeProfiles>;
export default handler;
