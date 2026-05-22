import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { PhoneProvider } from '../../../tools/auth0/handlers/phoneProvider';
type ParsedPhoneProvider = ParsedAsset<'phoneProviders', PhoneProvider[]>;
declare const phoneProvidersHandler: DirectoryHandler<ParsedPhoneProvider>;
export default phoneProvidersHandler;
