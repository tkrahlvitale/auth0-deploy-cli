import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { PhoneTemplate } from '../../../tools/auth0/handlers/phoneTemplates';
type ParsedPhoneTemplates = ParsedAsset<'phoneTemplates', PhoneTemplate[]>;
declare const phoneTemplatesHandler: DirectoryHandler<ParsedPhoneTemplates>;
export default phoneTemplatesHandler;
