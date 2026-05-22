import { YAMLHandler } from '.';
import { UserAttributeProfile } from '../../../tools/auth0/handlers/userAttributeProfiles';
import { ParsedAsset } from '../../../types';
type ParsedUserAttributeProfiles = ParsedAsset<'userAttributeProfiles', Partial<UserAttributeProfile>[]>;
declare const selfServiceProfileHandler: YAMLHandler<ParsedUserAttributeProfiles>;
export default selfServiceProfileHandler;
