import { DirectoryHandler } from '.';
import { ParsedAsset } from '../../../types';
import { RiskAssessment } from '../../../tools/auth0/handlers/riskAssessment';
type ParsedRiskAssessment = ParsedAsset<'riskAssessment', RiskAssessment>;
declare const riskAssessmentHandler: DirectoryHandler<ParsedRiskAssessment>;
export default riskAssessmentHandler;
