import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { Form } from '../../../tools/auth0/handlers/forms';
type ParsedFroms = ParsedAsset<'forms', Form[]>;
declare const formsHandler: DirectoryHandler<ParsedFroms>;
export default formsHandler;
