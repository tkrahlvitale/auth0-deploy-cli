import { YAMLHandler } from '.';
import { PhoneTemplate } from '../../../tools/auth0/handlers/phoneTemplates';
import { ParsedAsset } from '../../../types';
type ParsedPhoneTemplates = ParsedAsset<'phoneTemplates', PhoneTemplate[]>;
declare const phoneTemplatesHandler: YAMLHandler<ParsedPhoneTemplates>;
export default phoneTemplatesHandler;
