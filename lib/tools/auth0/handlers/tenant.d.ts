import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets } from '../../../types';
export declare const schema: {
    type: string;
    properties: {
        client_id_metadata_document_supported: {
            type: string;
            description: string;
        };
        default_token_quota: {
            type: string;
            properties: {
                clients: {
                    type: string;
                    properties: {
                        client_credentials: {
                            type: string;
                            properties: {
                                enforce: {
                                    type: string;
                                    default: boolean;
                                };
                                per_day: {
                                    type: string;
                                    minimum: number;
                                };
                                per_hour: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                            additionalProperties: boolean;
                            minProperties: number;
                        };
                    };
                    required: string[];
                };
                organizations: {
                    type: string;
                    properties: {
                        client_credentials: {
                            type: string;
                            properties: {
                                enforce: {
                                    type: string;
                                    default: boolean;
                                };
                                per_day: {
                                    type: string;
                                    minimum: number;
                                };
                                per_hour: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                            additionalProperties: boolean;
                            minProperties: number;
                        };
                    };
                    required: string[];
                };
            };
            additionalProperties: boolean;
            minProperties: number;
        };
        skip_non_verifiable_callback_uri_confirmation_prompt: {
            type: string[];
            description: string;
        };
        resource_parameter_profile: {
            type: string;
            enum: string[];
            description: string;
        };
        dynamic_client_registration_security_mode: {
            type: string;
            enum: string[];
            description: string;
        };
    };
};
export interface Tenant extends Management.GetTenantSettingsResponseContent {
    client_id_metadata_document_supported?: boolean;
    resource_parameter_profile?: Management.TenantSettingsResourceParameterProfile;
}
type TenantSettingsFlags = Management.TenantSettingsFlags;
export declare const allowedTenantFlags: string[];
export declare const removeUnallowedTenantFlags: (proposedFlags: TenantSettingsFlags | undefined) => TenantSettingsFlags;
export default class TenantHandler extends DefaultHandler {
    existing: Tenant;
    constructor(options: DefaultHandler);
    getType(): Promise<Asset>;
    validate(assets: Assets): Promise<void>;
    processChanges(assets: Assets): Promise<void>;
}
export {};
