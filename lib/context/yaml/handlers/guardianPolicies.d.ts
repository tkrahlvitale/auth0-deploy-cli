import { YAMLHandler } from '.';
import { ParsedAsset } from '../../../types';
type ParsedGuardianPolicies = ParsedAsset<'guardianPolicies', {
    policies: string[];
}>;
declare const guardianPoliciesHandler: YAMLHandler<ParsedGuardianPolicies>;
export default guardianPoliciesHandler;
