import { Management } from 'auth0';
import DefaultHandler from './default';
import { Assets } from '../../../types';
export declare const excludeSchema: {
    type: string;
    items: {
        type: string;
    };
};
export type ResourceServer = Management.ResourceServer;
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
            };
            identifier: {
                type: string;
            };
            scopes: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        name: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                    };
                };
            };
            enforce_policies: {
                type: string;
            };
            token_dialect: {
                type: string;
            };
            proof_of_possession: {
                type: string;
                properties: {
                    mechanism: {
                        type: string;
                        enum: ("mtls" | "dpop")[];
                    };
                    required: {
                        type: string;
                    };
                    required_for: {
                        type: string;
                        enum: ("public_clients" | "all_clients")[];
                    };
                };
                required: string[];
            };
            subject_type_authorization: {
                type: string;
                properties: {
                    user: {
                        type: string;
                        description: string;
                        properties: {
                            policy: {
                                type: string;
                                enum: ("allow_all" | "deny_all" | "require_client_grant")[];
                            };
                        };
                    };
                    client: {
                        type: string;
                        description: string;
                        properties: {
                            policy: {
                                type: string;
                                enum: ("deny_all" | "require_client_grant")[];
                            };
                        };
                    };
                };
                additionalProperties: boolean;
            };
            client_id: {
                type: string;
                description: string;
                readOnly: boolean;
            };
        };
        required: string[];
    };
};
export default class ResourceServersHandler extends DefaultHandler {
    existing: ResourceServer[];
    constructor(options: DefaultHandler);
    objString(resourceServer: any): string;
    getType(): Promise<ResourceServer[]>;
    validate(assets: Assets): Promise<void>;
    processChanges(assets: Assets): Promise<void>;
    updateResourceServer(id: string, update: ResourceServer): Promise<Management.UpdateResourceServerResponseContent>;
}
