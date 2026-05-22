import DefaultHandler from './default';
import { Assets } from '../../../types';
export declare const schema: {
    type: string;
    properties: {
        policies: {
            type: string;
            items: {
                type: string;
                enum: string[];
            };
        };
    };
    additionalProperties: boolean;
};
export default class GuardianPoliciesHandler extends DefaultHandler {
    existing: {
        policies: string[];
    };
    constructor(options: any);
    getType(): Promise<GuardianPoliciesHandler['existing'] | {}>;
    processChanges(assets: Assets): Promise<void>;
}
