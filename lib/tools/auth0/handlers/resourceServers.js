"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.excludeSchema = void 0;
const auth0_1 = require("auth0");
const validationError_1 = __importDefault(require("../../validationError"));
const constants_1 = __importDefault(require("../../constants"));
const default_1 = __importDefault(require("./default"));
const client_1 = require("../client");
exports.excludeSchema = {
    type: 'array',
    items: { type: 'string' },
};
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            identifier: { type: 'string' },
            scopes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                    },
                },
            },
            enforce_policies: { type: 'boolean' },
            token_dialect: { type: 'string' },
            proof_of_possession: {
                type: 'object',
                properties: {
                    mechanism: {
                        type: 'string',
                        enum: Object.values(auth0_1.Management.ResourceServerProofOfPossessionMechanismEnum),
                    },
                    required: { type: 'boolean' },
                    required_for: {
                        type: 'string',
                        enum: Object.values(auth0_1.Management.ResourceServerProofOfPossessionRequiredForEnum),
                    },
                },
                required: ['mechanism', 'required'],
            },
            subject_type_authorization: {
                type: 'object',
                properties: {
                    user: {
                        type: 'object',
                        description: 'Access Permissions for user-initiated flows',
                        properties: {
                            policy: {
                                type: 'string',
                                enum: Object.values(auth0_1.Management.ResourceServerSubjectTypeAuthorizationUserPolicyEnum),
                            },
                        },
                    },
                    client: {
                        type: 'object',
                        description: 'Access Permissions for client-initiated flows',
                        properties: {
                            policy: {
                                type: 'string',
                                enum: Object.values(auth0_1.Management.ResourceServerSubjectTypeAuthorizationClientPolicyEnum),
                            },
                        },
                    },
                },
                additionalProperties: false,
            },
            client_id: {
                type: 'string',
                description: 'The client ID of the client that this resource server is linked to (readonly)',
                readOnly: true,
            },
        },
        required: ['name', 'identifier'],
    },
};
class ResourceServersHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'resourceServers',
            identifiers: ['id', 'identifier'],
            stripCreateFields: ['client_id', 'is_system'],
            stripUpdateFields: ['identifier', 'client_id', 'is_system'],
            functions: {
                update: (id, data) => this.updateResourceServer(id, data),
            },
        });
    }
    objString(resourceServer) {
        return super.objString({ name: resourceServer.name, identifier: resourceServer.identifier });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        let resourceServers = await (0, client_1.paginate)(this.client.resourceServers.list, {
            paginate: true,
        });
        resourceServers = resourceServers.filter((rs) => rs.name !== constants_1.default.RESOURCE_SERVERS_MANAGEMENT_API_NAME);
        // Sanitize resource servers fields
        const sanitizeResourceServersFields = (rs) => rs.map((resourceServer) => {
            // For system resource servers like Auth0 My Account API, only allow certain fields to be updated
            if (resourceServer.is_system === true) {
                const allowedKeys = [
                    'token_lifetime',
                    'proof_of_possession',
                    'skip_consent_for_verifiable_first_party_clients',
                    'name',
                    'identifier',
                    'id',
                    'is_system',
                    'authorization_policy',
                ];
                const sanitized = {};
                allowedKeys.forEach((key) => {
                    if (key in resourceServer) {
                        sanitized[key] = resourceServer[key];
                    }
                });
                return sanitized;
            }
            return resourceServer;
        });
        this.existing = sanitizeResourceServersFields(resourceServers);
        return this.existing;
    }
    async validate(assets) {
        const { resourceServers } = assets;
        // Do nothing if not set
        if (!resourceServers)
            return;
        const mgmtAPIResource = resourceServers.find((r) => r.name === constants_1.default.RESOURCE_SERVERS_MANAGEMENT_API_NAME);
        if (mgmtAPIResource) {
            throw new validationError_1.default(`You can not configure the '${constants_1.default.RESOURCE_SERVERS_MANAGEMENT_API_NAME}'.`);
        }
        await super.validate(assets);
    }
    async processChanges(assets) {
        const { resourceServers } = assets;
        // Do nothing if not set
        if (!resourceServers)
            return;
        const excluded = (assets.exclude && assets.exclude.resourceServers) || [];
        const filterResourceServer = (items) => items.filter((r) => !excluded.includes(r.name));
        const { del, update, create, conflicts } = await this.calcChanges(assets);
        const changes = {
            del: filterResourceServer(del),
            update: filterResourceServer(update),
            create: filterResourceServer(create),
            conflicts: filterResourceServer(conflicts),
        };
        await super.processChanges(assets, {
            ...changes,
        });
    }
    async updateResourceServer(id, update) {
        // Exclude name from update as it cannot be modified for system resource servers like Auth0 My Account API
        if (update.is_system === true || update.name === 'Auth0 My Account API') {
            const updateFields = {
                token_lifetime: update.token_lifetime,
                proof_of_possession: update.proof_of_possession,
                skip_consent_for_verifiable_first_party_clients: update.skip_consent_for_verifiable_first_party_clients,
                subject_type_authorization: update.subject_type_authorization,
                authorization_policy: update.authorization_policy,
            };
            return this.client.resourceServers.update(id, updateFields);
        }
        return this.client.resourceServers.update(id, update);
    }
}
exports.default = ResourceServersHandler;
