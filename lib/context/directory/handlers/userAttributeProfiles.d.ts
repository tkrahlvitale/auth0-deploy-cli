import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { UserAttributeProfile } from '../../../tools/auth0/handlers/userAttributeProfiles';
type ParsedUserAttributeProfiles = ParsedAsset<'userAttributeProfiles', Partial<UserAttributeProfile>[]>;
declare const userAttributeProfilesHandler: DirectoryHandler<ParsedUserAttributeProfiles>;
export default userAttributeProfilesHandler;
