import { Management } from 'auth0';
import DefaultAPIHandler from './default';
import { Asset, Assets, CalculatedChanges } from '../../../types';
export type NetworkACL = Management.GetNetworkAclsResponseContent;
export declare const schema: {
    type: string;
    description: string;
    items: {
        type: string;
        required: string[];
        properties: {
            description: {
                type: string;
                maxLength: number;
            };
            active: {
                type: string;
            };
            priority: {
                type: string;
                minimum: number;
                maximum: number;
            };
            rule: {
                anyOf: {
                    type: string;
                    required: string[];
                    properties: {
                        action: {
                            type: string;
                            anyOf: ({
                                type: string;
                                required: string[];
                                properties: {
                                    block: {
                                        type: string;
                                        enum: boolean[];
                                    };
                                };
                                additionalProperties: boolean;
                            } | {
                                type: string;
                                required: string[];
                                properties: {
                                    allow: {
                                        type: string;
                                        enum: boolean[];
                                    };
                                };
                                additionalProperties: boolean;
                            } | {
                                type: string;
                                required: string[];
                                properties: {
                                    log: {
                                        type: string;
                                        enum: boolean[];
                                    };
                                };
                                additionalProperties: boolean;
                            } | {
                                type: string;
                                required: string[];
                                properties: {
                                    redirect: {
                                        type: string;
                                        enum: boolean[];
                                    };
                                    redirect_uri: {
                                        type: string;
                                        minLength: number;
                                        maxLength: number;
                                    };
                                };
                                additionalProperties: boolean;
                            })[];
                        };
                        match: {
                            type: string;
                            properties: {
                                asns: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                geo_country_codes: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                geo_subdivision_codes: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ipv4_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ipv6_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ja3_fingerprints: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ja4_fingerprints: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                user_agents: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                hostnames: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                };
                                connecting_ipv4_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                };
                                connecting_ipv6_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                };
                            };
                            additionalProperties: boolean;
                        };
                        not_match: {
                            type: string;
                            properties: {
                                asns: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                geo_country_codes: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                geo_subdivision_codes: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ipv4_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ipv6_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ja3_fingerprints: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                ja4_fingerprints: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                user_agents: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                };
                                hostnames: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                };
                                connecting_ipv4_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                };
                                connecting_ipv6_cidrs: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    uniqueItems: boolean;
                                };
                            };
                            additionalProperties: boolean;
                        };
                        scope: {
                            enum: string[];
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                }[];
            };
        };
        additionalProperties: boolean;
    };
};
export default class NetworkACLsHandler extends DefaultAPIHandler {
    existing: NetworkACL[] | null;
    constructor(config: DefaultAPIHandler);
    objString(acl: NetworkACL): string;
    getType(): Promise<Asset | null>;
    processChanges(assets: Assets): Promise<void>;
    createNetworkACL(acl: NetworkACL): Promise<NetworkACL>;
    createNetworkACLs(creates: CalculatedChanges['create']): Promise<void>;
    updateNetworkACL(acl: NetworkACL): Promise<Management.UpdateNetworkAclResponseContent>;
    updateNetworkACLs(updates: CalculatedChanges['update']): Promise<void>;
    deleteNetworkACL(acl: NetworkACL): Promise<void>;
    deleteNetworkACLs(data: Asset[]): Promise<void>;
}
