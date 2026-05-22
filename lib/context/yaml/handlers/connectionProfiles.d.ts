import YAMLContext from '..';
import { ConnectionProfile } from '../../../tools/auth0/handlers/connectionProfiles';
import { ParsedAsset } from '../../../types';
type ParsedConnectionProfiles = ParsedAsset<'connectionProfiles', Partial<ConnectionProfile>[]>;
declare function parse(context: YAMLContext): Promise<ParsedConnectionProfiles>;
declare function dump(context: YAMLContext): Promise<ParsedConnectionProfiles>;
declare const connectionProfilesHandler: {
    parse: typeof parse;
    dump: typeof dump;
};
export default connectionProfilesHandler;
