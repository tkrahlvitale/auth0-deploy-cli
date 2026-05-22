import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { Form } from '../../../tools/auth0/handlers/forms';
type ParsedForms = ParsedAsset<'forms', Partial<Form>[]>;
declare const pagesHandler: YAMLHandler<ParsedForms>;
export default pagesHandler;
