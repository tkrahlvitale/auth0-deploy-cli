import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { AttackProtection } from '../../../tools/auth0/handlers/attackProtection';
type ParsedAttackProtection = ParsedAsset<'attackProtection', AttackProtection>;
declare const attackProtectionHandler: DirectoryHandler<ParsedAttackProtection>;
export default attackProtectionHandler;
