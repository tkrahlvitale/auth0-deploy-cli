import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets } from '../../../types';
export declare const schema: {
    type: string;
    properties: {
        akamai_enabled: {
            type: string;
            description: string;
        };
    };
};
export type SupplementalSignals = Management.GetSupplementalSignalsResponseContent;
export default class SupplementalSignalsHandler extends DefaultHandler {
    existing: SupplementalSignals | null;
    constructor(options: DefaultHandler);
    getType(): Promise<Asset | null>;
    processChanges(assets: Assets): Promise<void>;
}
