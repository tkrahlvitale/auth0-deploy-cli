import DefaultAPIHandler from './default';
import { CalculatedChanges, Assets } from '../../../types';
import { Connection } from './connections';
import { Action } from './actions';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            strategy: {
                type: string;
                enum: string[];
                default: string;
            };
            name: {
                type: string;
            };
            options: {
                type: string;
                properties: {
                    authentication_methods: {
                        type: string;
                        properties: {
                            passkey: {
                                type: string;
                                properties: {
                                    enabled: {
                                        type: string;
                                    };
                                };
                            };
                            password: {
                                type: string;
                                properties: {
                                    enabled: {
                                        type: string;
                                    };
                                    api_behavior: {
                                        type: string;
                                        enum: string[];
                                    };
                                    signup_behavior: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                            email_otp: {
                                type: string;
                                properties: {
                                    enabled: {
                                        type: string;
                                    };
                                };
                            };
                            phone_otp: {
                                type: string;
                                properties: {
                                    enabled: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                    disable_self_service_change_password: {
                        type: string;
                        default: boolean;
                    };
                    customScripts: {
                        type: string;
                        properties: {};
                    };
                    attributes: {
                        type: string;
                        properties: {
                            email: {
                                type: string;
                                properties: {
                                    unique: {
                                        type: string;
                                        default: boolean;
                                    };
                                    identifier: {
                                        type: string;
                                        properties: {
                                            active: {
                                                type: string;
                                            };
                                            default_method: {
                                                type: string;
                                                enum: string[];
                                            };
                                        };
                                    };
                                    profile_required: {
                                        type: string;
                                    };
                                    verification_method: {
                                        type: string;
                                        enum: string[];
                                    };
                                    signup: {
                                        type: string;
                                        properties: {
                                            status: {
                                                type: string;
                                                enum: string[];
                                            };
                                            verification: {
                                                type: string;
                                                properties: {
                                                    active: {
                                                        type: string;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            phone_number: {
                                type: string;
                                properties: {
                                    identifier: {
                                        type: string;
                                        properties: {
                                            active: {
                                                type: string;
                                            };
                                            default_method: {
                                                type: string;
                                                enum: string[];
                                            };
                                        };
                                    };
                                    profile_required: {
                                        type: string;
                                    };
                                    signup: {
                                        type: string;
                                        properties: {
                                            status: {
                                                type: string;
                                                enum: string[];
                                            };
                                            verification: {
                                                type: string;
                                                properties: {
                                                    active: {
                                                        type: string;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            username: {
                                type: string;
                                properties: {
                                    identifier: {
                                        type: string;
                                        properties: {
                                            active: {
                                                type: string;
                                            };
                                            default_method: {
                                                type: string;
                                                enum: string[];
                                            };
                                        };
                                    };
                                    profile_required: {
                                        type: string;
                                    };
                                    signup: {
                                        type: string;
                                        properties: {
                                            status: {
                                                type: string;
                                                enum: string[];
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                    custom_password_hash: {
                        type: string;
                        properties: {
                            action_id: {
                                type: string;
                            };
                        };
                    };
                    password_options: {
                        type: string;
                        properties: {
                            complexity: {
                                type: string;
                                properties: {
                                    min_length: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    character_types: {
                                        type: string;
                                        items: {
                                            type: string;
                                            enum: string[];
                                        };
                                    };
                                    character_type_rule: {
                                        type: string;
                                        enum: string[];
                                    };
                                    identical_characters: {
                                        type: string;
                                        enum: string[];
                                    };
                                    sequential_characters: {
                                        type: string;
                                        enum: string[];
                                    };
                                    max_length_exceeded: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                            profile_data: {
                                type: string;
                                properties: {
                                    active: {
                                        type: string;
                                    };
                                    blocked_fields: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                        maxItems: number;
                                    };
                                };
                            };
                            history: {
                                type: string;
                                properties: {
                                    active: {
                                        type: string;
                                    };
                                    size: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            dictionary: {
                                type: string;
                                properties: {
                                    active: {
                                        type: string;
                                    };
                                    default: {
                                        type: string;
                                        enum: string[];
                                    };
                                    custom: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        required: string[];
    };
};
export default class DatabaseHandler extends DefaultAPIHandler {
    existing: Connection[] | null;
    constructor(config: DefaultAPIHandler);
    objString(db: any): string;
    getFormattedOptions(options: any, actions?: Action[]): any;
    validate(assets: Assets): Promise<void>;
    private validatePasswordOptions;
    private validatePasswordlessSettings;
    private validateEmailUniqueConstraints;
    getClientFN(fn: 'create' | 'delete' | 'getAll' | 'update'): Function;
    getType(): Promise<Connection[]>;
    calcChanges(assets: Assets): Promise<CalculatedChanges>;
    dryRunChanges(assets: Assets): Promise<CalculatedChanges>;
    processChanges(assets: Assets): Promise<void>;
}
