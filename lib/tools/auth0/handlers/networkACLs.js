"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const client_1 = require("../client");
const logger_1 = __importDefault(require("../../../logger"));
// Define action types
const BlockAction = {
    type: 'object',
    required: ['block'],
    properties: {
        block: {
            type: 'boolean',
            enum: [true],
        },
    },
    additionalProperties: false,
};
const AllowAction = {
    type: 'object',
    required: ['allow'],
    properties: {
        allow: {
            type: 'boolean',
            enum: [true],
        },
    },
    additionalProperties: false,
};
const LogAction = {
    type: 'object',
    required: ['log'],
    properties: {
        log: {
            type: 'boolean',
            enum: [true],
        },
    },
    additionalProperties: false,
};
const RedirectAction = {
    type: 'object',
    required: ['redirect', 'redirect_uri'],
    properties: {
        redirect: {
            type: 'boolean',
            enum: [true],
        },
        redirect_uri: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
        },
    },
    additionalProperties: false,
};
// Define MatchSchema
const MatchSchema = {
    type: 'object',
    properties: {
        asns: {
            type: 'array',
            items: {
                type: 'integer',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        geo_country_codes: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        geo_subdivision_codes: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        ipv4_cidrs: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        ipv6_cidrs: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        ja3_fingerprints: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        ja4_fingerprints: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        user_agents: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
        },
        hostnames: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
        },
        connecting_ipv4_cidrs: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
        },
        connecting_ipv6_cidrs: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
        },
    },
    additionalProperties: false,
};
exports.schema = {
    type: 'array',
    description: 'List of network ACL configurations',
    items: {
        type: 'object',
        required: ['description', 'active', 'priority', 'rule'],
        properties: {
            description: {
                type: 'string',
                maxLength: 255,
            },
            active: {
                type: 'boolean',
            },
            priority: {
                type: 'number',
                minimum: 1,
                maximum: 10,
            },
            rule: {
                anyOf: [
                    {
                        type: 'object',
                        required: ['action', 'scope', 'match'],
                        properties: {
                            action: {
                                type: 'object',
                                anyOf: [BlockAction, AllowAction, LogAction, RedirectAction],
                            },
                            match: MatchSchema,
                            not_match: MatchSchema,
                            scope: {
                                enum: ['management', 'authentication', 'tenant'],
                                type: 'string',
                            },
                        },
                        additionalProperties: false,
                    },
                    {
                        type: 'object',
                        required: ['action', 'scope', 'not_match'],
                        properties: {
                            action: {
                                type: 'object',
                                anyOf: [BlockAction, AllowAction, LogAction, RedirectAction],
                            },
                            not_match: MatchSchema,
                            match: MatchSchema,
                            scope: {
                                enum: ['management', 'authentication', 'tenant'],
                                type: 'string',
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        },
        additionalProperties: false,
    },
};
class NetworkACLsHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'networkACLs',
            id: 'id',
            identifiers: ['id', 'priority', 'active', 'rule'],
            stripCreateFields: ['created_at', 'updated_at'],
            stripUpdateFields: ['created_at', 'updated_at'],
        });
    }
    objString(acl) {
        return super.objString({
            description: acl.description,
            active: acl.active,
            priority: acl.priority,
        });
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        try {
            const networkACLs = await (0, client_1.paginate)(this.client.networkAcls.list, {
                paginate: true,
            });
            this.existing = networkACLs;
            return this.existing;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return null;
            }
            if (err.statusCode === 403) {
                logger_1.default.debug('Tenant ACL Management is not enabled for this tenant. Please verify `scope` or contact Auth0 support to enable this feature.');
                return null;
            }
            throw err;
        }
    }
    async processChanges(assets) {
        const { networkACLs } = assets;
        // Do nothing if not set
        if (!networkACLs)
            return;
        const { del, update, create } = await this.calcChanges(assets);
        logger_1.default.debug(`Start processChanges for network ACLs [delete:${del.length}] [update:${update.length}], [create:${create.length}]`);
        const changes = [{ del: del }, { create: create }, { update: update }];
        await Promise.all(changes.map(async (change) => {
            switch (true) {
                case change.del && change.del.length > 0:
                    await this.deleteNetworkACLs(change.del || []);
                    break;
                case change.create && change.create.length > 0:
                    await this.createNetworkACLs(change.create);
                    break;
                case change.update && change.update.length > 0:
                    if (change.update)
                        await this.updateNetworkACLs(change.update);
                    break;
                default:
                    break;
            }
        }));
    }
    async createNetworkACL(acl) {
        await this.client.networkAcls.create(acl);
        return acl;
    }
    async createNetworkACLs(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createNetworkACL(item)
                .then((data) => {
                this.didCreate(data);
                this.created += 1;
            })
                .catch((err) => {
                throw new Error(`Problem creating ${this.type} ${this.objString(item)}\n${err}`);
            }),
        })
            .promise();
    }
    async updateNetworkACL(acl) {
        const { id, ...updateParams } = acl;
        if (!id) {
            throw new Error(`Missing id for ${this.type} ${this.objString(acl)}`);
        }
        const updated = await this.client.networkAcls.update(id, updateParams);
        return updated;
    }
    async updateNetworkACLs(updates) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updateNetworkACL(item)
                .then((data) => {
                this.didUpdate(data);
                this.updated += 1;
            })
                .catch((err) => {
                throw new Error(`Problem updating ${this.type} ${this.objString(item)}\n${err}`);
            }),
        })
            .promise();
    }
    async deleteNetworkACL(acl) {
        if (!acl.id) {
            throw new Error(`Missing id for ${this.type} ${this.objString(acl)}`);
        }
        await this.client.networkAcls.delete(acl.id);
    }
    async deleteNetworkACLs(data) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: data || [],
                generator: (item) => this.deleteNetworkACL(item)
                    .then(() => {
                    this.didDelete(item);
                    this.deleted += 1;
                })
                    .catch((err) => {
                    throw new Error(`Problem deleting ${this.type} ${this.objString(item)}\n${err}`);
                }),
            })
                .promise();
        }
        else {
            logger_1.default.warn(`Detected the following ${this.type} should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${data.map((i) => this.objString(i)).join('\n')}`);
        }
    }
}
exports.default = NetworkACLsHandler;
