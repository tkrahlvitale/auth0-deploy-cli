import DefaultHandler from './default';
import { Asset, Assets } from '../../../types';
export declare const schema: {
    type: string;
    properties: {
        provider: {
            type: string;
            enum: string[];
        };
    };
    additionalProperties: boolean;
};
export default class GuardianPhoneSelectedProviderHandler extends DefaultHandler {
    existing: Asset;
    constructor(options: any);
    getType(): Promise<Asset | null>;
    processChanges(assets: Assets): Promise<void>;
}
