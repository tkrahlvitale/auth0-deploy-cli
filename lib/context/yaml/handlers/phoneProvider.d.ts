import { YAMLHandler } from '.';
import { PhoneProvider } from '../../../tools/auth0/handlers/phoneProvider';
import { ParsedAsset } from '../../../types';
type ParsedPhoneProviders = ParsedAsset<'phoneProviders', PhoneProvider[]>;
declare const phoneProviderHandler: YAMLHandler<ParsedPhoneProviders>;
export default phoneProviderHandler;
