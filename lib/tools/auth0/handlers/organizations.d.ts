import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets, CalculatedChanges } from '../../../types';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
            };
            display_name: {
                type: string;
            };
            branding: {
                type: string;
            };
            metadata: {
                type: string;
            };
            connections: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        connection_id: {
                            type: string;
                        };
                        organization_connection_name: {
                            type: string;
                        };
                        assign_membership_on_login: {
                            type: string;
                        };
                        show_as_button: {
                            type: string;
                        };
                        is_signup_enabled: {
                            type: string;
                        };
                        organization_access_level: {
                            type: string;
                            enum: ("none" | "readonly" | "limited" | "full")[];
                        };
                        is_enabled: {
                            type: string;
                        };
                    };
                };
            };
            client_grants: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        client_id: {
                            type: string;
                        };
                    };
                };
                default: never[];
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
            discovery_domains: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        domain: {
                            type: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                        };
                        use_for_organization_discovery: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
        };
        required: string[];
    };
};
type FormattedClientGrants = {
    grant_id: string | undefined;
    client_id: string | undefined;
};
export default class OrganizationsHandler extends DefaultHandler {
    existing: Asset[];
    formattedClientGrants: FormattedClientGrants[];
    constructor(config: DefaultHandler);
    deleteOrganization(org: any): Promise<void>;
    deleteOrganizations(data: Asset[]): Promise<void>;
    createOrganization(org: any): Promise<Asset>;
    createOrganizations(creates: CalculatedChanges['create']): Promise<void>;
    updateOrganization(org: any, organizations: any): Promise<{
        id: any;
    }>;
    getClientGrantIDByClientName(clientsName: string): string;
    getFormattedClientGrants(): Promise<FormattedClientGrants[]>;
    updateOrganizations(updates: CalculatedChanges['update'], orgs: Asset[]): Promise<void>;
    getType(): Promise<Asset[]>;
    processChanges(assets: Assets): Promise<void>;
    getOrganizationConnections(organizationId: string): Promise<Management.OrganizationConnection[]>;
    getOrganizationClientGrants(organizationId: string): Promise<Management.OrganizationClientGrant[]>;
    createOrganizationClientGrants(organizationId: string, grantId: string): Promise<Management.AssociateOrganizationClientGrantResponseContent>;
    deleteOrganizationClientGrants(organizationId: string, grantId: string): Promise<void>;
    getAllOrganizationDiscoveryDomains(organizationId: string): Promise<Management.OrganizationDiscoveryDomain[] | null>;
    getOrganizationDiscoveryDomain(organizationId: string, discoveryDomainId: string): Promise<Management.GetOrganizationDiscoveryDomainResponseContent>;
    createOrganizationDiscoveryDomain(organizationId: string, discoveryDomain: Management.CreateOrganizationDiscoveryDomainRequestContent): Promise<Management.CreateOrganizationDiscoveryDomainResponseContent>;
    updateOrganizationDiscoveryDomain(organizationId: string, discoveryDomainId: string, discoveryDomain: string, discoveryDomainUpdate: Management.UpdateOrganizationDiscoveryDomainRequestContent): Promise<Management.UpdateOrganizationDiscoveryDomainResponseContent>;
    deleteOrganizationDiscoveryDomain(organizationId: string, discoveryDomain: string, discoveryDomainId: string): Promise<void>;
}
export {};
