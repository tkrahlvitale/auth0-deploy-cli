import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets } from '../../../types';
export type Form = {
    name: string;
    body: string;
};
export type FormResponse = Management.GetFormResponseContent;
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
            };
            body: {
                type: string;
            };
        };
        required: string[];
    };
    additionalProperties: boolean;
};
export default class FormsHandler extends DefaultHandler {
    existing: Asset;
    constructor(options: DefaultHandler);
    objString(item: any): string;
    getForms(forms: Array<Management.FormSummary>): Promise<Management.GetFormResponseContent[]>;
    getType(): Promise<Asset>;
    formateFormFlowId(forms: any, flowIdMap: any): Promise<Asset>;
    pargeFormFlowName(forms: any, flowNameMap: any): Promise<Form[]>;
    processChanges(assets: Assets): Promise<void>;
}
