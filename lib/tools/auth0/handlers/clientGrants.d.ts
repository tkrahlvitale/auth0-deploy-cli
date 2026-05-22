import { Management } from 'auth0';
import DefaultHandler from './default';
import { Assets } from '../../../types';
import DefaultAPIHandler from './default';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            client_id: {
                type: string;
            };
            audience: {
                type: string;
            };
            scope: {
                type: string;
                items: {
                    type: string;
                };
                uniqueItems: boolean;
            };
            subject_type: {
                type: string;
                enum: ("client" | "user")[];
                description: string;
            };
            authorization_details_types: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                uniqueItems: boolean;
            };
            allow_all_scopes: {
                type: string;
                description: string;
            };
            default_for: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export type ClientGrant = Management.ClientGrantResponseContent;
export default class ClientGrantsHandler extends DefaultHandler {
    existing: ClientGrant[] | null;
    constructor(config: DefaultAPIHandler);
    objString(item: any): string;
    validate(assets: Assets): Promise<void>;
    getType(): Promise<ClientGrant[]>;
    processChanges(assets: Assets): Promise<void>;
}
