import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { SupplementalSignals } from '../../../tools/auth0/handlers/supplementalSignals';
type ParsedSupplementalSignals = ParsedAsset<'supplementalSignals', SupplementalSignals>;
declare const _default: DirectoryHandler<ParsedSupplementalSignals>;
export default _default;
