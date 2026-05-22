import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
import { SupplementalSignals } from '../../../tools/auth0/handlers/supplementalSignals';
type ParsedSupplementalSignals = ParsedAsset<'supplementalSignals', SupplementalSignals>;
declare const supplementalSignalsHandler: YAMLHandler<ParsedSupplementalSignals>;
export default supplementalSignalsHandler;
