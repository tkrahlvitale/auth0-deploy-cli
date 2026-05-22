"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionProfile = exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const client_1 = require("../client");
const logger_1 = __importDefault(require("../../../logger"));
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            organization: {
                type: 'object',
                properties: {
                    show_as_button: {
                        type: 'string',
                        enum: ['none', 'optional', 'required'],
                    },
                    assign_membership_on_login: {
                        type: 'string',
                        enum: ['none', 'optional', 'required'],
                    },
                },
            },
            connection_name_prefix_template: {
                type: 'string',
            },
            enabled_features: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['scim', 'universal_logout'],
                },
                uniqueItems: true,
            },
            connection_config: {
                type: ['object', 'null'],
            },
            strategy_overrides: {
                type: ['object', 'null'],
                properties: {
                    pingfederate: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    ad: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    adfs: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    waad: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    'google-apps': {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    okta: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    oidc: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                    samlp: {
                        type: 'object',
                        properties: {
                            enabled_features: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: ['scim', 'universal_logout'],
                                },
                                uniqueItems: true,
                            },
                            connection_config: {
                                type: 'object',
                            },
                        },
                    },
                },
            },
        },
        required: ['name'],
    },
};
const getConnectionProfile = async (auth0Client) => {
    try {
        const connectionProfiles = await (0, client_1.paginate)(auth0Client.connectionProfiles?.list, {
            checkpoint: true,
            take: 10,
        });
        return connectionProfiles;
    }
    catch (err) {
        if (err.statusCode === 404 || err.statusCode === 501) {
            return [];
        }
        if (err.statusCode === 403) {
            logger_1.default.debug('Connections Profile is not enabled for this tenant. Please verify `scope` or contact Auth0 support to enable this feature.');
            return [];
        }
        throw err;
    }
};
exports.getConnectionProfile = getConnectionProfile;
class ConnectionProfilesHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'connectionProfiles',
            id: 'id',
            identifiers: ['id', 'name'],
        });
    }
    objString(item) {
        return super.objString({
            name: item.name,
        });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        this.existing = await (0, exports.getConnectionProfile)(this.client);
        return this.existing;
    }
    async processChanges(assets) {
        const { connectionProfiles } = assets;
        // Do nothing if not set
        if (!connectionProfiles)
            return;
        const { del, update, create, conflicts } = await this.calcChanges(assets);
        const changes = {
            del: del,
            update: update,
            create: create,
            conflicts: conflicts,
        };
        // Process using the default implementation
        await super.processChanges(assets, {
            ...changes,
        });
    }
}
exports.default = ConnectionProfilesHandler;
