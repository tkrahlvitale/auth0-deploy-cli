"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processConnectionEnabledClients = exports.updateConnectionEnabledClients = exports.getConnectionEnabledClients = exports.addExcludedConnectionPropertiesToChanges = exports.schema = void 0;
const dot_prop_1 = __importDefault(require("dot-prop"));
const lodash_1 = require("lodash");
const auth0_1 = require("auth0");
const default_1 = __importStar(require("./default"));
const utils_1 = require("../../utils");
const client_1 = require("../client");
const scimHandler_1 = __importDefault(require("./scimHandler"));
const logger_1 = __importDefault(require("../../../logger"));
const validationError_1 = __importDefault(require("../../validationError"));
const connectionOptionsSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
        api_enable_groups: {
            type: 'boolean',
        },
        dpop_signing_alg: {
            type: 'string',
            enum: ['ES256', 'ES384', 'ES512', 'Ed25519'],
        },
        token_endpoint_auth_signing_alg: {
            type: 'string',
            enum: Object.values(auth0_1.Management.ConnectionTokenEndpointAuthSigningAlgEnum),
        },
        id_token_signed_response_algs: {
            type: 'array',
            items: {
                type: 'string',
                enum: Object.values(auth0_1.Management.ConnectionIdTokenSignedResponseAlgEnum),
            },
        },
        token_endpoint_jwtca_aud_format: {
            type: 'string',
            enum: Object.values(auth0_1.Management.ConnectionTokenEndpointJwtcaAudFormatEnumOidc),
        },
    },
};
const oidcOktaStrategies = new Set(['oidc', 'okta']);
const oidcOktaOnlyConnectionOptionFields = [
    'token_endpoint_auth_signing_alg',
    'id_token_signed_response_algs',
    'token_endpoint_jwtca_aud_format',
];
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            strategy: { type: 'string' },
            options: connectionOptionsSchema,
            enabled_clients: { type: 'array', items: { type: 'string' } },
            realms: { type: 'array', items: { type: 'string' } },
            metadata: { type: 'object' },
            scim_configuration: {
                type: 'object',
                properties: {
                    connection_name: { type: 'string' },
                    mapping: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: { scim: { type: 'string' }, auth0: { type: 'string' } },
                        },
                    },
                    user_id_attribute: { type: 'string' },
                },
                required: ['mapping', 'user_id_attribute'],
            },
            authentication: {
                type: 'object',
                properties: {
                    active: { type: 'boolean' },
                },
                required: ['active'],
                additionalProperties: false,
            },
            connected_accounts: {
                type: 'object',
                properties: {
                    active: { type: 'boolean' },
                },
                required: ['active'],
                additionalProperties: false,
            },
            directory_provisioning_configuration: {
                type: 'object',
                properties: {
                    mapping: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                auth0: { type: 'string', description: 'The field location in the Auth0 schema' },
                                idp: { type: 'string', description: 'The field location in the IDP schema' },
                            },
                        },
                    },
                    synchronize_automatically: {
                        type: 'boolean',
                        description: 'The field whether periodic automatic synchronization is enabled',
                    },
                    synchronize_groups: {
                        type: 'string',
                        enum: Object.values(auth0_1.Management.SynchronizeGroupsEnum),
                    },
                    synchronized_groups: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                            },
                            required: ['id'],
                        },
                    },
                },
            },
        },
        required: ['name', 'strategy'],
    },
};
// addExcludedConnectionPropertiesToChanges superimposes excluded properties on the `options` object. The Auth0 API
// will overwrite the options property when updating connections, so it is necessary to add excluded properties back in to prevent those excluded properties from being deleted.
// This use case is common because organizations may not want to expose sensitive connection details, but want to preserve them in the tenant.
// exported only for unit testing purposes
const addExcludedConnectionPropertiesToChanges = ({ proposedChanges, existingConnections, config, }) => {
    if (proposedChanges.update.length === 0)
        return proposedChanges;
    // @ts-ignore because this expects a parameter to be passed
    const excludedFields = config()?.EXCLUDED_PROPS?.connections || [];
    if (excludedFields.length === 0)
        return proposedChanges;
    const existingConnectionsMap = (0, lodash_1.keyBy)(existingConnections, 'id');
    const excludedOptions = excludedFields.filter(
    // Only include fields that pertain to options
    (excludedField) => excludedField.startsWith('options'));
    const newProposedUpdates = proposedChanges.update.map((proposedConnection) => {
        const currConnection = existingConnectionsMap[proposedConnection.id];
        const currentExcludedPropertyValues = excludedOptions.reduce((agg, excludedField) => {
            if (!dot_prop_1.default.has(currConnection, excludedField))
                return agg;
            const currentExcludedFieldValue = dot_prop_1.default.get(currConnection, excludedField);
            dot_prop_1.default.set(agg, excludedField, currentExcludedFieldValue);
            return agg;
        }, {
            options: {},
        });
        return {
            ...proposedConnection,
            options: {
                ...proposedConnection.options,
                ...currentExcludedPropertyValues.options,
            },
        };
    });
    return {
        ...proposedChanges,
        update: newProposedUpdates,
    };
};
exports.addExcludedConnectionPropertiesToChanges = addExcludedConnectionPropertiesToChanges;
/**
 * Retrieves all enabled client IDs for a specific Auth0 connection.
 * @param auth0Client - The Auth0 API client instance used to make requests
 * @param connectionId - The unique identifier of the connection to fetch enabled clients for
 * @returns A promise that resolves to an array of client IDs, or null if connectionId is empty or an error occurs
 */
const getConnectionEnabledClients = async (auth0Client, connectionId) => {
    if (!connectionId)
        return null;
    try {
        logger_1.default.debug(`Getting enabled clients for connection ${connectionId}`);
        const enabledClients = [];
        let page = await auth0Client.connections.clients.get(connectionId, { take: 100 });
        enabledClients.push(...(page.data || []));
        while (page.hasNextPage && page.hasNextPage()) {
            page = await page.getNextPage();
            enabledClients.push(...(page.data || []));
        }
        return enabledClients.filter((client) => !!client?.client_id).map((client) => client.client_id);
    }
    catch (error) {
        logger_1.default.warn(`Unable to retrieve enabled clients for connection ${connectionId}: ${error?.message}`);
        return null;
    }
};
exports.getConnectionEnabledClients = getConnectionEnabledClients;
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
const updateConnectionEnabledClients = async (auth0Client, typeName, connectionId, enabledClientIds, existingConnections) => {
    if (!connectionId || !Array.isArray(enabledClientIds) || !enabledClientIds.length)
        return false;
    let existingEnabledClients = [];
    if (Array.isArray(existingConnections)) {
        const existingConnection = existingConnections.find((con) => con.id === connectionId);
        existingEnabledClients = existingConnection?.enabled_clients ?? [];
    }
    // Determine which clients to enable vs. disable by comparing the incoming `enabledClientIds` with the `existingEnabledClients`.
    const enabledClientIdSet = new Set(enabledClientIds);
    const existingClientIdSet = new Set(existingEnabledClients);
    // If both sets are identical, skip the update entirely.
    if (enabledClientIdSet.size === existingClientIdSet.size &&
        [...enabledClientIdSet].every((id) => existingClientIdSet.has(id))) {
        logger_1.default.debug(`Enabled clients for ${typeName}: ${connectionId} are unchanged, skipping update`);
        return true;
    }
    const clientsToEnable = enabledClientIds;
    // Any client that exists on the tenant but not in the provided `enabledClientIds` should be disabled.
    const clientsToDisable = existingEnabledClients.filter((clientId) => !enabledClientIdSet.has(clientId));
    const enabledClientUpdatePayloads = [
        ...clientsToEnable.map((clientId) => ({
            client_id: clientId,
            status: true,
        })),
        ...clientsToDisable.map((clientId) => ({
            client_id: clientId,
            status: false,
        })),
    ];
    const payloadChunks = (0, lodash_1.chunk)(enabledClientUpdatePayloads, 50);
    try {
        await Promise.all(payloadChunks.map((payload) => auth0Client.connections.clients.update(connectionId, payload)));
        logger_1.default.debug(`Updated enabled clients for ${typeName}: ${connectionId}`);
        return true;
    }
    catch (error) {
        logger_1.default.error(`Unable to update enabled clients for ${typeName}: ${connectionId}:`, error);
        return false;
    }
};
exports.updateConnectionEnabledClients = updateConnectionEnabledClients;
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
const processConnectionEnabledClients = async (auth0Client, typeName, existingConnections, changes, delayMs = 2500 // Default delay is 2.5 seconds
) => {
    const { create, update, conflicts } = changes;
    let createWithId = [];
    if (create.length) {
        await (0, utils_1.sleep)(delayMs); // Wait for the configured duration before fetching new connections
        createWithId = await Promise.all(create.map(async (conn) => {
            let newConnections;
            if (typeName === 'database') {
                const { data: connections } = await auth0Client.connections.list({
                    name: conn.name,
                    take: 1,
                    strategy: [auth0_1.Management.ConnectionStrategyEnum.Auth0],
                    include_fields: true,
                });
                newConnections = connections;
            }
            else {
                const { data: connections } = await auth0Client.connections.list({
                    name: conn.name,
                    take: 1,
                    include_fields: true,
                });
                newConnections = connections;
            }
            if (newConnections && newConnections.length) {
                conn.id = newConnections[0]?.id;
            }
            else {
                logger_1.default.warn(`Unable to find ID for newly created ${typeName} '${conn.name}' when updating enabled clients`);
            }
            return conn;
        }));
    }
    // Process enabled clients for each change type
    // Delete is handled by the `processChanges` method, removed connection completely
    await Promise.all([
        ...createWithId.map((conn) => (0, exports.updateConnectionEnabledClients)(auth0Client, typeName, conn.id, conn.enabled_clients, existingConnections)),
        ...update.map((conn) => (0, exports.updateConnectionEnabledClients)(auth0Client, typeName, conn.id, conn.enabled_clients, existingConnections)),
        ...conflicts.map((conn) => (0, exports.updateConnectionEnabledClients)(auth0Client, typeName, conn.id, conn.enabled_clients, existingConnections)),
    ]);
};
exports.processConnectionEnabledClients = processConnectionEnabledClients;
class ConnectionsHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'connections',
            stripUpdateFields: ['strategy', 'name'],
            functions: {
                // When `connections` is updated, it can result in `update`,`create` or `delete` action on SCIM.
                // Because, `scim_configuration` is inside `connections`.
                update: async (connectionId, bodyParams) => this.scimHandler.updateOverride(connectionId, bodyParams),
                // When a new `connection` is created. We can perform only `create` option on SCIM.
                // When a connection is `deleted`. `scim_configuration` is also deleted along with it; no action on SCIM is required.
                create: async (bodyParams) => this.scimHandler.createOverride(bodyParams),
            },
        });
        // @ts-ignore
        this.scimHandler = new scimHandler_1.default(this.config, this.client.connections, this.client.pool);
    }
    objString(connection) {
        return super.objString({ name: connection.name, id: connection.id });
    }
    getFormattedOptions(connection, clients) {
        try {
            return {
                options: {
                    ...connection.options,
                    idpinitiated: {
                        ...connection.options.idpinitiated,
                        client_id: (0, utils_1.convertClientNameToId)(connection.options.idpinitiated.client_id, clients),
                    },
                },
            };
        }
        catch (e) {
            return {};
        }
    }
    async validate(assets) {
        const { connections } = assets;
        if (!connections) {
            await super.validate(assets);
            return;
        }
        connections.forEach((connection) => {
            if (!connection?.options)
                return;
            const strategy = connection?.strategy ?? 'unknown';
            if (oidcOktaStrategies.has(strategy))
                return;
            const unsupportedFields = oidcOktaOnlyConnectionOptionFields.filter((field) => field in connection.options);
            if (unsupportedFields.length > 0) {
                throw new validationError_1.default(`Connection "${connection.name}": option(s) ${unsupportedFields
                    .map((field) => `"${field}"`)
                    .join(', ')} are only supported for strategies "oidc" and "okta". Found strategy "${strategy}".`);
            }
        });
        await super.validate(assets);
    }
    /**
     * Retrieves all directory provisioning configurations for all connections.
     * @returns A promise that resolves to the configurations object, or null if not configured/supported
     */
    async getConnectionDirectoryProvisionings() {
        let directoryProvisioningConfigs;
        try {
            directoryProvisioningConfigs = await (0, client_1.paginate)(this.client.connections.directoryProvisioning.list, {
                checkpoint: true,
            });
            return directoryProvisioningConfigs;
        }
        catch (error) {
            const errLog = `Unable to fetch directory provisioning for connections. `;
            if (error instanceof auth0_1.ManagementError) {
                const bodyMessage = error.body?.message;
                logger_1.default.warn(errLog + bodyMessage);
            }
            else {
                logger_1.default.error(errLog, error?.message);
            }
            return null;
        }
    }
    /**
     * Creates directory provisioning configuration for a connection.
     */
    async createConnectionDirectoryProvisioning(connectionId, payload) {
        if (!connectionId) {
            throw new Error('Connection ID is required to create directory provisioning configuration.');
        }
        const createPayload = {
            mapping: payload.mapping,
            synchronize_automatically: payload.synchronize_automatically,
            ...(payload.synchronize_groups && { synchronize_groups: payload.synchronize_groups }),
        };
        await this.client.connections.directoryProvisioning.create(connectionId, createPayload);
        logger_1.default.debug(`Created directory provisioning for connection '${connectionId}'`);
    }
    /**
     * Updates directory provisioning configuration for a connection.
     */
    async updateConnectionDirectoryProvisioning(connectionId, payload) {
        if (!connectionId) {
            throw new Error('Connection ID is required to update directory provisioning configuration.');
        }
        const updatePayload = {
            mapping: payload.mapping,
            synchronize_automatically: payload.synchronize_automatically,
            ...(payload.synchronize_groups && { synchronize_groups: payload.synchronize_groups }),
        };
        await this.client.connections.directoryProvisioning.update(connectionId, updatePayload);
        logger_1.default.debug(`Updated directory provisioning for connection '${connectionId}'`);
    }
    /**
     * Deletes directory provisioning configuration for a connection.
     */
    async deleteConnectionDirectoryProvisioning(connectionId) {
        if (!connectionId) {
            throw new Error('Connection ID is required to delete directory provisioning configuration.');
        }
        await this.client.connections.directoryProvisioning.delete(connectionId);
        logger_1.default.debug(`Deleted directory provisioning for connection '${connectionId}'`);
    }
    /**
     * Retrieves all synchronized groups for a connection using checkpoint pagination.
     */
    async getConnectionSynchronizedGroups(connectionId) {
        try {
            const groups = [];
            let page = await this.client.connections.directoryProvisioning.listSynchronizedGroups(connectionId, {});
            for (const g of page.data ?? [])
                groups.push({ id: g.id });
            while (page.hasNextPage?.()) {
                page = await page.getNextPage();
                for (const g of page.data ?? [])
                    groups.push({ id: g.id });
            }
            return groups;
        }
        catch (error) {
            const errLog = `Unable to fetch synchronized groups for connection '${connectionId}'. `;
            const statusCode = error?.statusCode;
            if (statusCode != null && [403, 404, 501].includes(statusCode)) {
                const bodyMessage = error instanceof auth0_1.ManagementError ? error.body?.message : error.message;
                logger_1.default.warn(errLog + bodyMessage);
                return null;
            }
            throw error;
        }
    }
    /**
     * Replaces the synchronized groups for a connection (PUT replace-all semantics).
     */
    async updateConnectionSynchronizedGroups(connectionId, groups) {
        await this.client.connections.directoryProvisioning.set(connectionId, { groups });
        logger_1.default.debug(`Updated synchronized groups for connection '${connectionId}'`);
    }
    /**
     * This function processes directory provisioning for create, update, and conflict operations.
     * Directory provisioning is only supported for google-apps strategy connections.
     *
     * @param changes - Object containing arrays of connections to create, update, and resolve conflicts for
     */
    async processConnectionDirectoryProvisioning(changes) {
        const { create, update, conflicts } = changes;
        // Build a map of existing connections by ID for quick lookup
        const existingConnectionsMap = (0, lodash_1.keyBy)(this.existing || [], 'id');
        // Filter to only google-apps connections
        const googleAppsWithDirProvFilter = (conn) => conn.strategy === 'google-apps';
        const connectionsToProcess = [
            ...update.filter(googleAppsWithDirProvFilter),
            ...create.filter(googleAppsWithDirProvFilter),
            ...conflicts.filter(googleAppsWithDirProvFilter),
        ];
        if (connectionsToProcess.length === 0) {
            return;
        }
        const directoryConnectionsToUpdate = [];
        const directoryConnectionsToCreate = [];
        const directoryConnectionsToDelete = [];
        for (const conn of connectionsToProcess) {
            if (!conn.id)
                continue;
            const existingConn = existingConnectionsMap[conn.id];
            const existingConfig = existingConn?.directory_provisioning_configuration;
            const proposedConfig = conn.directory_provisioning_configuration;
            if (existingConfig && proposedConfig) {
                directoryConnectionsToUpdate.push(conn);
            }
            else if (!existingConfig && proposedConfig) {
                directoryConnectionsToCreate.push(conn);
            }
            else if (existingConfig && !proposedConfig) {
                directoryConnectionsToDelete.push(conn);
            }
        }
        // Process updates first
        await this.client.pool
            .addEachTask({
            data: directoryConnectionsToUpdate || [],
            generator: (conn) => this.updateConnectionDirectoryProvisioning(conn.id, conn.directory_provisioning_configuration).catch((err) => {
                throw new Error(`Failed to update directory provisioning for connection '${conn.id}':\n${err}`);
            }),
        })
            .promise();
        // Process creates
        await this.client.pool
            .addEachTask({
            data: directoryConnectionsToCreate || [],
            generator: (conn) => this.createConnectionDirectoryProvisioning(conn.id, conn.directory_provisioning_configuration).catch((err) => {
                throw new Error(`Failed to create directory provisioning for connection '${conn.id}':\n${err}`);
            }),
        })
            .promise();
        // Process deletes
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: directoryConnectionsToDelete || [],
                generator: (conn) => this.deleteConnectionDirectoryProvisioning(conn.id).catch((err) => {
                    throw new Error(`Failed to delete directory provisioning for connection '${conn.id}':\n${err}`);
                }),
            })
                .promise();
        }
        else if (directoryConnectionsToDelete.length) {
            logger_1.default.warn(`Detected directory provisioning configs to delete. Deletes are disabled (set 'AUTH0_ALLOW_DELETE' to true to allow).\n${directoryConnectionsToDelete
                .map((i) => this.objString(i))
                .join('\n')}`);
        }
        // Process synchronized groups for connections where synchronize_groups === 'selected'
        const connectionsToSyncGroups = [
            ...directoryConnectionsToCreate,
            ...directoryConnectionsToUpdate,
        ].filter((conn) => conn.directory_provisioning_configuration?.synchronize_groups === 'selected' &&
            conn.directory_provisioning_configuration?.synchronized_groups !== undefined);
        await this.client.pool
            .addEachTask({
            data: connectionsToSyncGroups,
            generator: (conn) => this.updateConnectionSynchronizedGroups(conn.id, conn.directory_provisioning_configuration.synchronized_groups).catch((err) => {
                throw new Error(`Failed to update synchronized groups for connection '${conn.id}':\n${err}`);
            }),
        })
            .promise();
    }
    async getType() {
        if (this.existing)
            return this.existing;
        const [connections, directoryProvisioningConfigs] = await Promise.all([
            (0, client_1.paginate)(this.client.connections.list, {
                checkpoint: true,
            }),
            this.getConnectionDirectoryProvisionings(),
        ]);
        // Filter out database connections as we have separate handler for it
        const filteredConnections = connections.filter((c) => c.strategy !== 'auth0');
        // If options option is empty for all connection, log the missing options scope.
        const isOptionExists = filteredConnections.every((c) => c.options && Object.keys(c.options).length > 0);
        if (!isOptionExists) {
            logger_1.default.warn(`Insufficient scope the read:connections_options scope is required to get ${this.type} options.`);
        }
        this.existing = filteredConnections;
        if (this.existing === null)
            return [];
        const connectionTasks = filteredConnections.map((con, index) => ({ con, index }));
        const connectionsWithEnabledClients = await this.client.pool
            .addEachTask({
            data: connectionTasks,
            generator: async ({ con, index }) => {
                if (!con?.id) {
                    return { index, connection: con };
                }
                const enabledClients = await (0, exports.getConnectionEnabledClients)(this.client, con.id);
                let connection = { ...con };
                if (enabledClients?.length) {
                    connection.enabled_clients = enabledClients;
                }
                if (connection.strategy === 'google-apps' && directoryProvisioningConfigs) {
                    const dirProvConfig = directoryProvisioningConfigs.find((configCon) => configCon.connection_id === con.id);
                    if (dirProvConfig) {
                        connection.directory_provisioning_configuration = {
                            mapping: dirProvConfig.mapping,
                            synchronize_automatically: dirProvConfig.synchronize_automatically,
                            ...(dirProvConfig.synchronize_groups && {
                                synchronize_groups: dirProvConfig.synchronize_groups,
                            }),
                        };
                        if (dirProvConfig.synchronize_groups === 'selected') {
                            const syncedGroups = await this.getConnectionSynchronizedGroups(con.id);
                            if (syncedGroups?.length) {
                                connection.directory_provisioning_configuration.synchronized_groups =
                                    syncedGroups;
                            }
                        }
                    }
                }
                return { index, connection };
            },
        })
            .promise();
        this.existing = connectionsWithEnabledClients
            .sort((a, b) => a.index - b.index)
            .map(({ connection }) => connection);
        // Apply `scim_configuration` to all the relevant `SCIM` connections. This method mutates `this.existing`.
        await this.scimHandler.applyScimConfiguration(this.existing);
        return this.existing;
    }
    async calcChanges(assets) {
        const { connections } = assets;
        // Do nothing if not set
        if (!connections)
            return {
                del: [],
                create: [],
                update: [],
                conflicts: [],
            };
        // Convert enabled_clients by name to the id
        const clients = await (0, client_1.paginate)(this.client.clients.list, {
            paginate: true,
            include_totals: true,
        });
        const existingConnections = await (0, client_1.paginate)(this.client.connections.list, {
            checkpoint: true,
            include_totals: true,
        });
        // Prepare an id map. We'll use this map later to get the `strategy` and SCIM enable status of the connections.
        await this.scimHandler.createIdMap(existingConnections);
        const formatted = connections.map((connection) => {
            const enabledClients = (0, utils_1.getEnabledClients)(assets, connection, existingConnections, clients);
            return {
                ...connection,
                ...this.getFormattedOptions(connection, clients),
                ...(enabledClients !== undefined && { enabled_clients: enabledClients }),
            };
        });
        const proposedChanges = await super.calcChanges({ ...assets, connections: formatted });
        const proposedChangesWithExcludedProperties = (0, exports.addExcludedConnectionPropertiesToChanges)({
            proposedChanges,
            existingConnections,
            config: this.config,
        });
        return proposedChangesWithExcludedProperties;
    }
    async dryRunChanges(assets) {
        const { connections } = assets;
        if (!connections) {
            return {
                del: [],
                create: [],
                update: [],
                conflicts: [],
            };
        }
        const clients = await (0, client_1.paginate)(this.client.clients.list, {
            paginate: true,
            include_totals: true,
        });
        const existingConnections = await (0, client_1.paginate)(this.client.connections.list, {
            checkpoint: true,
            include_totals: true,
        });
        await this.scimHandler.createIdMap(existingConnections);
        const formatted = connections.map((connection) => {
            const enabledClients = (0, utils_1.getEnabledClients)(assets, connection, existingConnections, clients);
            return {
                ...connection,
                ...this.getFormattedOptions(connection, clients),
                ...(enabledClients !== undefined && { enabled_clients: enabledClients }),
            };
        });
        const proposedChanges = await super.dryRunChanges({ ...assets, connections: formatted });
        return (0, exports.addExcludedConnectionPropertiesToChanges)({
            proposedChanges,
            existingConnections,
            config: this.config,
        });
    }
    // Run after clients are updated so we can convert all the enabled_clients names to id's
    async processChanges(assets) {
        const { connections } = assets;
        // Do nothing if not set
        if (!connections)
            return;
        // If options option is empty for all connection, log the missing options scope.
        const isOptionExists = connections.every((c) => c.options && Object.keys(c.options).length > 0);
        if (!isOptionExists) {
            logger_1.default.warn(`Insufficient scope the update:connections_options scope is required to update ${this.type} options.`);
        }
        const includedConnections = (assets.include && assets.include.connections) || [];
        const excludedConnections = (assets.exclude && assets.exclude.connections) || [];
        let changes = await this.calcChanges(assets);
        changes = (0, utils_1.filterExcluded)(changes, excludedConnections);
        changes = (0, utils_1.filterIncluded)(changes, includedConnections);
        await super.processChanges(assets, changes);
        // process enabled clients
        await (0, exports.processConnectionEnabledClients)(this.client, this.type, await this.existing, changes);
        // process directory provisioning
        await this.processConnectionDirectoryProvisioning(changes);
    }
}
exports.default = ConnectionsHandler;
__decorate([
    (0, default_1.order)('60')
], ConnectionsHandler.prototype, "processChanges", null);
