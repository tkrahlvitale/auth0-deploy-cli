import { Management } from 'auth0';
import { Assets, Auth0APIClient } from '../../../types';
import DefaultAPIHandler from './default';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
            };
            organization: {
                type: string;
                properties: {
                    show_as_button: {
                        type: string;
                        enum: string[];
                    };
                    assign_membership_on_login: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            connection_name_prefix_template: {
                type: string;
            };
            enabled_features: {
                type: string;
                items: {
                    type: string;
                    enum: string[];
                };
                uniqueItems: boolean;
            };
            connection_config: {
                type: string[];
            };
            strategy_overrides: {
                type: string[];
                properties: {
                    pingfederate: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    ad: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    adfs: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    waad: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    'google-apps': {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    okta: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    oidc: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                    samlp: {
                        type: string;
                        properties: {
                            enabled_features: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                uniqueItems: boolean;
                            };
                            connection_config: {
                                type: string;
                            };
                        };
                    };
                };
            };
        };
        required: string[];
    };
};
export type ConnectionProfile = Management.ConnectionProfile;
export declare const getConnectionProfile: (auth0Client: Auth0APIClient) => Promise<ConnectionProfile[]>;
export default class ConnectionProfilesHandler extends DefaultAPIHandler {
    existing: ConnectionProfile[];
    constructor(config: DefaultAPIHandler);
    objString(item: any): string;
    getType(): Promise<ConnectionProfile[]>;
    processChanges(assets: Assets): Promise<void>;
}
