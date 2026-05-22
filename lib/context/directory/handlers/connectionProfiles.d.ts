import DirectoryContext from '..';
import { ParsedAsset } from '../../../types';
import { ConnectionProfile } from '../../../tools/auth0/handlers/connectionProfiles';
type ParsedConnectionProfiles = ParsedAsset<'connectionProfiles', Partial<ConnectionProfile>[]>;
declare function parse(context: DirectoryContext): ParsedConnectionProfiles;
declare function dump(context: DirectoryContext): Promise<void>;
declare const connectionProfilesHandler: {
    parse: typeof parse;
    dump: typeof dump;
};
export default connectionProfilesHandler;
