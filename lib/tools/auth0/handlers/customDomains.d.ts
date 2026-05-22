import { Management } from 'auth0';
import DefaultAPIHandler from './default';
import { Asset, Assets } from '../../../types';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            custom_domain_id: {
                type: string;
            };
            custom_client_ip_header: {
                type: string;
                nullable: boolean;
                enum: (string | null)[];
            };
            domain: {
                type: string;
            };
            primary: {
                type: string;
            };
            status: {
                type: string;
            };
            type: {
                type: string;
                enum: string[];
            };
            verification: {
                type: string;
            };
            tls_policy: {
                type: string;
                description: string;
                defaultValue: string;
            };
            domain_metadata: {
                type: string;
                description: string;
                defaultValue: undefined;
                maxProperties: number;
            };
            verification_method: {
                type: string;
                description: string;
                defaultValue: string;
            };
            relying_party_identifier: {
                type: string[];
                description: string;
            };
            is_default: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
type CustomDomain = Management.CustomDomain;
export default class CustomDomainsHadnler extends DefaultAPIHandler {
    existing: CustomDomain[] | null;
    constructor(config: DefaultAPIHandler);
    objString(item: Asset): string;
    getType(): Promise<Asset | null>;
    validate(assets: Assets): Promise<void>;
    processChanges(assets: Assets): Promise<void>;
}
export {};
