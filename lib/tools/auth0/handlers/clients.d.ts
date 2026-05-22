import { Management } from 'auth0';
import { Assets, Auth0APIClient, CalculatedChanges } from '../../../types';
import DefaultAPIHandler from './default';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
                minLength: number;
                pattern: string;
            };
            external_client_id: {
                type: string;
                description: string;
            };
            external_metadata_type: {
                type: string;
                description: string;
            };
            external_metadata_created_by: {
                type: string;
                description: string;
            };
            jwks_uri: {
                type: string;
                description: string;
            };
            mobile: {
                type: string;
                properties: {
                    android: {
                        type: string;
                        properties: {
                            app_package_name: {
                                type: string;
                            };
                            sha256_cert_fingerprints: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                    ios: {
                        type: string;
                        properties: {
                            team_id: {
                                type: string;
                            };
                            app_bundle_identifier: {
                                type: string;
                            };
                        };
                    };
                };
            };
            native_social_login: {
                type: string;
                properties: {
                    apple: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                        };
                    };
                    facebook: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                        };
                    };
                    google: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                        };
                    };
                };
            };
            refresh_token: {
                type: string[];
                description: string;
                properties: {
                    policies: {
                        type: string[];
                        description: string;
                        items: {
                            type: string;
                            properties: {
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
                            };
                            required: string[];
                        };
                    };
                };
            };
            token_quota: {
                type: string[];
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
            session_transfer: {
                type: string;
                properties: {
                    can_create_session_transfer_token: {
                        type: string;
                        description: string;
                        default: boolean;
                    };
                    enforce_cascade_revocation: {
                        type: string;
                        description: string;
                        default: boolean;
                    };
                    allowed_authentication_methods: {
                        type: string[];
                        description: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    enforce_device_binding: {
                        type: string;
                        description: string;
                        enum: string[];
                        default: string;
                    };
                    allow_refresh_token: {
                        type: string;
                        description: string;
                        default: boolean;
                    };
                    enforce_online_refresh_tokens: {
                        type: string;
                        description: string;
                        default: boolean;
                    };
                };
                additionalProperties: boolean;
            };
            app_type: {
                type: string;
                description: string;
            };
            resource_server_identifier: {
                type: string;
                description: string;
            };
            organization_usage: {
                type: string;
                enum: string[];
            };
            organization_require_behavior: {
                type: string;
                enum: string[];
            };
            organization_discovery_methods: {
                type: string[];
                items: {
                    type: string;
                    enum: string[];
                };
            };
            my_organization_configuration: {
                type: string[];
                description: string;
                properties: {
                    connection_profile_id: {
                        type: string;
                        description: string;
                    };
                    user_attribute_profile_id: {
                        type: string;
                        description: string;
                    };
                    allowed_strategies: {
                        type: string;
                        description: string;
                        items: {
                            type: string;
                            enum: ("samlp" | "pingfederate" | "adfs" | "waad" | "google-apps" | "okta" | "oidc")[];
                        };
                        uniqueItems: boolean;
                    };
                    connection_deletion_behavior: {
                        type: string;
                        enum: ("allow" | "allow_if_empty")[];
                        description: string;
                    };
                };
                required: string[];
            };
            async_approval_notification_channels: {
                type: string[];
                description: string;
                items: {
                    type: string;
                    enum: string[];
                };
            };
            skip_non_verifiable_callback_uri_confirmation_prompt: {
                type: string[];
                description: string;
            };
            express_configuration: {
                type: string[];
                description: string;
                properties: {
                    initiate_login_uri_template: {
                        type: string;
                        description: string;
                    };
                    user_attribute_profile_id: {
                        type: string;
                        description: string;
                    };
                    connection_profile_id: {
                        type: string;
                        description: string;
                    };
                    enable_client: {
                        type: string;
                        description: string;
                    };
                    enable_organization: {
                        type: string;
                        description: string;
                    };
                    linked_clients: {
                        type: string;
                        description: string;
                        items: {
                            type: string;
                            properties: {
                                client_id: {
                                    type: string;
                                    description: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    okta_oin_client_id: {
                        type: string;
                        description: string;
                    };
                    admin_login_domain: {
                        type: string;
                        description: string;
                    };
                    oin_submission_id: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
            token_exchange: {
                type: string[];
                description: string;
                properties: {
                    allow_any_profile_of_type: {
                        type: string;
                        description: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            third_party_security_mode: {
                type: string;
                enum: string[];
                description: string;
            };
            redirection_policy: {
                type: string;
                enum: string[];
                description: string;
            };
            oidc_logout: {
                type: string[];
                description: string;
                properties: {
                    backchannel_logout_urls: {
                        type: string;
                        description: string;
                        items: {
                            type: string;
                        };
                    };
                    backchannel_logout_initiators: {
                        type: string;
                        description: string;
                        properties: {
                            mode: {
                                type: string;
                                schemaName: string;
                                enum: string[];
                                description: string;
                            };
                            selected_initiators: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                    description: string;
                                };
                            };
                        };
                    };
                    backchannel_logout_session_metadata: {
                        type: string[];
                        description: string;
                        properties: {
                            include: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                };
            };
        };
        required: string[];
    };
};
export type Client = Management.Client;
export default class ClientHandler extends DefaultAPIHandler {
    existing: Client[];
    constructor(config: DefaultAPIHandler);
    objString(item: any): string;
    calcChanges(assets: Assets): Promise<CalculatedChanges>;
    processChanges(assets: Assets): Promise<void>;
    getType(): Promise<Management.Client[]>;
    private isCimdClient;
    private createClient;
    private getCIMDEditableFields;
    private updateClient;
    sanitizeMapClientReferences(auth0Client: Auth0APIClient, clientList: Client[]): Promise<Client[]>;
}
