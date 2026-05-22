import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets } from '../../../types';
export type Flow = {
    name: string;
    body: string;
};
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
export default class FlowHandler extends DefaultHandler {
    existing: Asset;
    constructor(options: DefaultHandler);
    objString(item: any): string;
    getFlows(flows: Array<Management.FlowSummary>): Promise<Management.GetFlowResponseContent[]>;
    getType(): Promise<Asset>;
    processChanges(assets: Assets): Promise<void>;
    formateFlowConnectionId(flows: any, connectionIdMap: any): Promise<Asset>;
    pargeFlowConnectionName(flows: any, connectionNameMap: any): Promise<Flow[]>;
}
