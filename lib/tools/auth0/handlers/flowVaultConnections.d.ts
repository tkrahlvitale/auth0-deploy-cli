import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets, Auth0APIClient, CalculatedChanges } from '../../../types';
export type FlowVaultConnection = Management.GetFlowsVaultConnectionResponseContent;
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
            };
            app_id: {
                type: string;
                enum: string[];
            };
            environment: {
                type: string;
            };
            setup: {
                type: string;
            };
            account_name: {
                type: string;
            };
            ready: {
                type: string;
            };
        };
        required: string[];
    };
    additionalProperties: boolean;
};
export declare const getAllFlowConnections: (auth0Client: Auth0APIClient) => Promise<Management.FlowsVaultConnectionSummary[]>;
export default class FlowVaultHandler extends DefaultHandler {
    existing: Asset;
    constructor(options: DefaultHandler);
    objString(item: any): string;
    getType(): Promise<Asset>;
    processChanges(assets: Assets): Promise<void>;
    createVaultConnection(conn: any): Promise<Asset>;
    createVaultConnections(creates: CalculatedChanges['create']): Promise<void>;
    updateVaultConnection(conn: any): Promise<Management.UpdateFlowsVaultConnectionResponseContent>;
    updateVaultConnections(updates: CalculatedChanges['update']): Promise<void>;
    deleteVaultConnection(conn: any): Promise<void>;
    deleteVaultConnections(data: Asset[]): Promise<void>;
}
