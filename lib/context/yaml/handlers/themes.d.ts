import { YAMLHandler } from '.';
import { Theme } from '../../../tools/auth0/handlers/themes';
import { ParsedAsset } from '../../../types';
type ParsedThemes = ParsedAsset<'themes', Theme[]>;
declare const themesHandler: YAMLHandler<ParsedThemes>;
export default themesHandler;
