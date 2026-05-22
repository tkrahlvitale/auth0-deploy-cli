import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { SsProfileWithCustomText } from '../../../tools/auth0/handlers/selfServiceProfiles';
type ParsedSelfServiceProfiles = ParsedAsset<'selfServiceProfiles', Partial<SsProfileWithCustomText>[]>;
declare const emailProviderHandler: DirectoryHandler<ParsedSelfServiceProfiles>;
export default emailProviderHandler;
