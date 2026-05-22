import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { NetworkACL } from '../../../tools/auth0/handlers/networkACLs';
type ParsedNetworkACLs = ParsedAsset<'networkACLs', NetworkACL[]>;
declare const networkACLsHandler: YAMLHandler<ParsedNetworkACLs>;
export default networkACLsHandler;
