import { Management } from 'auth0';
import DefaultAPIHandler from './default';
import { CalculatedChanges, Asset, Assets, Auth0APIClient } from '../../../types';
import { ConfigFunction } from '../../../configFactory';
import ScimHandler from './scimHandler';
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
            };
            strategy: {
                type: string;
            };
            options: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    api_enable_groups: {
                        type: string;
                    };
                    dpop_signing_alg: {
                        type: string;
                        enum: string[];
                    };
                    token_endpoint_auth_signing_alg: {
                        type: string;
                        enum: ("RS256" | "RS512" | "PS256" | "ES256" | "ES384" | "PS384" | "RS384")[];
                    };
                    id_token_signed_response_algs: {
                        type: string;
                        items: {
                            type: string;
                            enum: ("RS256" | "RS512" | "PS256" | "ES256" | "ES384" | "PS384" | "RS384")[];
                        };
                    };
                    token_endpoint_jwtca_aud_format: {
                        type: string;
                        enum: ("issuer" | "token_endpoint")[];
                    };
                };
            };
            enabled_clients: {
                type: string;
                items: {
                    type: string;
                };
            };
            realms: {
                type: string;
                items: {
                    type: string;
                };
            };
            metadata: {
                type: string;
            };
            scim_configuration: {
                type: string;
                properties: {
                    connection_name: {
                        type: string;
                    };
                    mapping: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                scim: {
                                    type: string;
                                };
                                auth0: {
                                    type: string;
                                };
                            };
                        };
                    };
                    user_id_attribute: {
                        type: string;
                    };
                };
                required: string[];
            };
            authentication: {
                type: string;
                properties: {
                    active: {
                        type: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            connected_accounts: {
                type: string;
                properties: {
                    active: {
                        type: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            directory_provisioning_configuration: {
                type: string;
                properties: {
                    mapping: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                auth0: {
                                    type: string;
                                    description: string;
                                };
                                idp: {
                                    type: string;
                                    description: string;
                                };
                            };
                        };
                    };
                    synchronize_automatically: {
                        type: string;
                        description: string;
                    };
                    synchronize_groups: {
                        type: string;
                        enum: ("all" | "off" | "selected")[];
                    };
                    synchronized_groups: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                id: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
            };
        };
        required: string[];
    };
};
type DirectoryProvisioningConfig = Management.DirectoryProvisioning;
export type Connection = Management.ConnectionForList & {
    enabled_clients?: string[];
    directory_provisioning_configuration?: Pick<DirectoryProvisioningConfig, 'mapping' | 'synchronize_automatically' | 'synchronize_groups'> & {
        synchronized_groups?: Array<{
            id: string;
        }>;
    };
};
export declare const addExcludedConnectionPropertiesToChanges: ({ proposedChanges, existingConnections, config, }: {
    proposedChanges: CalculatedChanges;
    existingConnections: Asset[];
    config: ConfigFunction;
}) => CalculatedChanges | {
    update: {
        options: any;
    }[];
    del: Asset[];
    conflicts: Asset[];
    create: Asset[];
};
/**
 * Retrieves all enabled client IDs for a specific Auth0 connection.
 * @param auth0Client - The Auth0 API client instance used to make requests
 * @param connectionId - The unique identifier of the connection to fetch enabled clients for
 * @returns A promise that resolves to an array of client IDs, or null if connectionId is empty or an error occurs
 */
export declare const getConnectionEnabledClients: (auth0Client: Auth0APIClient, connectionId: string) => Promise<string[] | null>;
/**
 * Updates the enabled clients for a specific Auth0 connection.
 *
 * @param auth0Client - The Auth0 API client instance used to make the connection update request
 * @param typeName - The type name of the connection (used for error logging purposes)
 * @param connectionId - The unique identifier of the connection to update
 * @param enabledClientIds - Array of client IDs that should be enabled for this connection
 * @returns Promise that resolves to true if the update was successful, false otherwise
 *
 */
export declare const updateConnectionEnabledClients: (auth0Client: Auth0APIClient, typeName: string, connectionId: string, enabledClientIds: string[], existingConnections: Asset[] | Asset | null) => Promise<boolean>;
/**
 * This function processes enabled clients for create, update, and conflict operations.
 * Note: This function mutates the `create` array by adding IDs to the connection objects after creation.
 *
 * @param auth0Client - The Auth0 API client instance used to make API calls
 * @param typeName - The type of connection being processed (e.g., 'database', 'connection')
 * @param changes - Object containing arrays of connections to create, update, and resolve conflicts for
 * @param delayMs - Optional delay in milliseconds before fetching new connections (default: 2500ms)
 *
 * @returns A Promise that resolves when all enabled client updates are complete
 */
export declare const processConnectionEnabledClients: (auth0Client: Auth0APIClient, typeName: string, existingConnections: Asset[] | null, changes: CalculatedChanges, delayMs?: number) => Promise<void>;
export default class ConnectionsHandler extends DefaultAPIHandler {
    existing: Connection[] | null;
    scimHandler: ScimHandler;
    constructor(config: DefaultAPIHandler);
    objString(connection: any): string;
    getFormattedOptions(connection: any, clients: any): {
        options: any;
    } | {
        options?: undefined;
    };
    validate(assets: Assets): Promise<void>;
    /**
     * Retrieves all directory provisioning configurations for all connections.
     * @returns A promise that resolves to the configurations object, or null if not configured/supported
     */
    getConnectionDirectoryProvisionings(): Promise<DirectoryProvisioningConfig[] | null>;
    /**
     * Creates directory provisioning configuration for a connection.
     */
    private createConnectionDirectoryProvisioning;
    /**
     * Updates directory provisioning configuration for a connection.
     */
    private updateConnectionDirectoryProvisioning;
    /**
     * Deletes directory provisioning configuration for a connection.
     */
    private deleteConnectionDirectoryProvisioning;
    /**
     * Retrieves all synchronized groups for a connection using checkpoint pagination.
     */
    getConnectionSynchronizedGroups(connectionId: string): Promise<Array<{
        id: string;
    }> | null>;
    /**
     * Replaces the synchronized groups for a connection (PUT replace-all semantics).
     */
    private updateConnectionSynchronizedGroups;
    /**
     * This function processes directory provisioning for create, update, and conflict operations.
     * Directory provisioning is only supported for google-apps strategy connections.
     *
     * @param changes - Object containing arrays of connections to create, update, and resolve conflicts for
     */
    processConnectionDirectoryProvisioning(changes: CalculatedChanges): Promise<void>;
    getType(): Promise<Asset[] | null>;
    calcChanges(assets: Assets): Promise<CalculatedChanges>;
    dryRunChanges(assets: Assets): Promise<CalculatedChanges>;
    processChanges(assets: Assets): Promise<void>;
}
export {};
