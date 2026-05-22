import { YAMLHandler } from '.';
import { AttackProtection } from '../../../tools/auth0/handlers/attackProtection';
import { ParsedAsset } from '../../../types';
type ParsedAttackProtection = ParsedAsset<'attackProtection', AttackProtection>;
declare const attackProtectionHandler: YAMLHandler<ParsedAttackProtection>;
export default attackProtectionHandler;
