import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { SsProfileWithCustomText } from '../../../tools/auth0/handlers/selfServiceProfiles';
type ParsedSelfServiceProfiles = ParsedAsset<'selfServiceProfiles', Partial<SsProfileWithCustomText>[]>;
declare const selfServiceProfileHandler: YAMLHandler<ParsedSelfServiceProfiles>;
export default selfServiceProfileHandler;
