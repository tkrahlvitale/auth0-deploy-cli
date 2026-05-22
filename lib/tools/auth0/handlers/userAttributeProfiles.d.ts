import { Management } from 'auth0';
import DefaultAPIHandler from './default';
import { Assets, Auth0APIClient } from '../../../types';
export type UserAttributeProfile = Management.UserAttributeProfile;
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            id: {
                type: string;
            };
            name: {
                type: string;
            };
            user_id: {
                type: string;
                properties: {
                    oidc_mapping: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                    saml_mapping: {
                        type: string;
                        items: {
                            type: string;
                        };
                        minItems: number;
                        maxItems: number;
                    };
                    scim_mapping: {
                        type: string;
                        default: string;
                    };
                    strategy_overrides: {
                        type: string;
                        properties: {};
                    };
                };
            };
            user_attributes: {
                type: string;
                minProperties: number;
                maxProperties: number;
                additionalProperties: {
                    type: string;
                    required: string[];
                    additionalProperties: boolean;
                    properties: {
                        description: {
                            description: string;
                            type: string;
                            minLength: number;
                            maxLength: number;
                        };
                        label: {
                            description: string;
                            type: string;
                            minLength: number;
                            maxLength: number;
                        };
                        profile_required: {
                            description: string;
                            type: string;
                        };
                        auth0_mapping: {
                            description: string;
                            type: string;
                            minLength: number;
                            maxLength: number;
                        };
                        oidc_mapping: {
                            type: string;
                            additionalProperties: boolean;
                            required: string[];
                            properties: {
                                mapping: {
                                    type: string;
                                };
                                display_name: {
                                    description: string;
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                };
                            };
                        };
                        saml_mapping: {
                            type: string;
                            items: {
                                description: string;
                                type: string;
                                minLength: number;
                                maxLength: number;
                            };
                            minItems: number;
                            maxItems: number;
                            uniqueItems: boolean;
                        };
                        scim_mapping: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                        };
                        strategy_overrides: {
                            type: string;
                            additionalProperties: boolean;
                            properties: {};
                        };
                    };
                };
            };
        };
    };
};
export declare const getUserAttributeProfiles: (auth0Client: Auth0APIClient) => Promise<UserAttributeProfile[]>;
export default class UserAttributeProfilesHandler extends DefaultAPIHandler {
    existing: UserAttributeProfile[];
    constructor(options: DefaultAPIHandler);
    getType(): Promise<Management.UserAttributeProfile[]>;
    processChanges(assets: Assets): Promise<void>;
}
