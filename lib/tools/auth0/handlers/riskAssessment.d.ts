import DefaultAPIHandler from './default';
import { Assets } from '../../../types';
import { Management } from 'auth0';
export declare const schema: {
    type: string;
    properties: {
        settings: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        new_device: {
            type: string;
            properties: {
                remember_for: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    required: string[];
};
export type RiskAssessment = {
    settings: Management.GetRiskAssessmentsSettingsResponseContent;
    new_device?: Management.GetRiskAssessmentsSettingsNewDeviceResponseContent;
};
export default class RiskAssessmentHandler extends DefaultAPIHandler {
    existing: RiskAssessment;
    constructor(config: DefaultAPIHandler);
    getType(): Promise<RiskAssessment>;
    processChanges(assets: Assets): Promise<void>;
}
