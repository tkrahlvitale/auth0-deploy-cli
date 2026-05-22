import { YAMLHandler } from '.';
import { RiskAssessment } from '../../../tools/auth0/handlers/riskAssessment';
import { ParsedAsset } from '../../../types';
type ParsedRiskAssessment = ParsedAsset<'riskAssessment', RiskAssessment>;
declare const riskAssessmentHandler: YAMLHandler<ParsedRiskAssessment>;
export default riskAssessmentHandler;
