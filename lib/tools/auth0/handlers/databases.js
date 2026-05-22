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
exports.schema = void 0;
const auth0_1 = require("auth0");
const default_1 = __importStar(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const utils_1 = require("../../utils");
const client_1 = require("../client");
const logger_1 = __importDefault(require("../../../logger"));
const calculateDryRunChanges_1 = require("../../calculateDryRunChanges");
const connections_1 = require("./connections");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            strategy: { type: 'string', enum: ['auth0'], default: 'auth0' },
            name: { type: 'string' },
            options: {
                type: 'object',
                properties: {
                    authentication_methods: {
                        type: 'object',
                        properties: {
                            passkey: {
                                type: 'object',
                                properties: {
                                    enabled: { type: 'boolean' },
                                },
                            },
                            password: {
                                type: 'object',
                                properties: {
                                    enabled: { type: 'boolean' },
                                    api_behavior: { type: 'string', enum: ['required', 'optional'] },
                                    signup_behavior: { type: 'string', enum: ['allow', 'block'] },
                                },
                            },
                            email_otp: {
                                type: 'object',
                                properties: {
                                    enabled: { type: 'boolean' },
                                },
                            },
                            phone_otp: {
                                type: 'object',
                                properties: {
                                    enabled: { type: 'boolean' },
                                },
                            },
                        },
                    },
                    disable_self_service_change_password: { type: 'boolean', default: false },
                    customScripts: {
                        type: 'object',
                        properties: {
                            ...constants_1.default.DATABASE_SCRIPTS.reduce((o, script) => ({ ...o, [script]: { type: 'string' } }), {}),
                        },
                    },
                    attributes: {
                        type: 'object',
                        properties: {
                            email: {
                                type: 'object',
                                properties: {
                                    unique: { type: 'boolean', default: true },
                                    identifier: {
                                        type: 'object',
                                        properties: {
                                            active: { type: 'boolean' },
                                            default_method: { type: 'string', enum: ['password', 'email_otp'] },
                                        },
                                    },
                                    profile_required: { type: 'boolean' },
                                    verification_method: { type: 'string', enum: ['otp', 'link'] },
                                    signup: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', enum: ['required', 'optional', 'inactive'] },
                                            verification: {
                                                type: 'object',
                                                properties: {
                                                    active: { type: 'boolean' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            phone_number: {
                                type: 'object',
                                properties: {
                                    identifier: {
                                        type: 'object',
                                        properties: {
                                            active: { type: 'boolean' },
                                            default_method: { type: 'string', enum: ['password', 'phone_otp'] },
                                        },
                                    },
                                    profile_required: { type: 'boolean' },
                                    signup: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', enum: ['required', 'optional', 'inactive'] },
                                            verification: {
                                                type: 'object',
                                                properties: {
                                                    active: { type: 'boolean' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            username: {
                                type: 'object',
                                properties: {
                                    identifier: {
                                        type: 'object',
                                        properties: {
                                            active: { type: 'boolean' },
                                            default_method: { type: 'string', enum: ['password'] },
                                        },
                                    },
                                    profile_required: { type: 'boolean' },
                                    signup: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', enum: ['required', 'optional', 'inactive'] },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    custom_password_hash: {
                        type: 'object',
                        properties: {
                            action_id: { type: 'string' },
                        },
                    },
                    password_options: {
                        type: 'object',
                        properties: {
                            complexity: {
                                type: 'object',
                                properties: {
                                    min_length: { type: 'integer', minimum: 1, maximum: 72 },
                                    character_types: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                            enum: ['uppercase', 'lowercase', 'number', 'special'],
                                        },
                                    },
                                    character_type_rule: { type: 'string', enum: ['all', 'three_of_four'] },
                                    identical_characters: { type: 'string', enum: ['allow', 'block'] },
                                    sequential_characters: { type: 'string', enum: ['allow', 'block'] },
                                    max_length_exceeded: { type: 'string', enum: ['truncate', 'error'] },
                                },
                            },
                            profile_data: {
                                type: 'object',
                                properties: {
                                    active: { type: 'boolean' },
                                    blocked_fields: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        maxItems: 12,
                                    },
                                },
                            },
                            history: {
                                type: 'object',
                                properties: {
                                    active: { type: 'boolean' },
                                    size: { type: 'integer', minimum: 1, maximum: 24 },
                                },
                            },
                            dictionary: {
                                type: 'object',
                                properties: {
                                    active: { type: 'boolean' },
                                    default: { type: 'string', enum: ['en_10k', 'en_100k'] },
                                    custom: { type: 'array', items: { type: 'string' } },
                                },
                            },
                        },
                    },
                },
            },
        },
        required: ['name'],
    },
};
class DatabaseHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'databases',
            stripUpdateFields: ['strategy', 'name'],
        });
    }
    objString(db) {
        return super.objString({ name: db.name, id: db.id });
    }
    getFormattedOptions(options, actions = []) {
        try {
            const formattedOptions = { ...options };
            // Handle custom_password_hash.action_id conversion
            if (options?.custom_password_hash?.action_id) {
                formattedOptions.custom_password_hash = {
                    ...options.custom_password_hash,
                    action_id: (0, utils_1.convertActionNameToId)(options.custom_password_hash.action_id, actions),
                };
            }
            return formattedOptions;
        }
        catch (e) {
            return {};
        }
    }
    async validate(assets) {
        const { databases } = assets;
        // Do nothing if not set
        if (!databases)
            return;
        // Validate each database
        databases.forEach((database) => {
            this.validateEmailUniqueConstraints(database);
            this.validatePasswordOptions(database);
            // this.validatePasswordlessSettings(database); // Enable only when feature is GA PR:#1282
        });
        await super.validate(assets);
    }
    validatePasswordOptions(payload) {
        const options = payload?.options;
        if (!options?.password_options)
            return;
        const legacyFields = [
            'passwordPolicy',
            'password_complexity_options',
            'password_history',
            'password_no_personal_info',
            'password_dictionary',
        ];
        const conflictingField = legacyFields.find((field) => field in options);
        if (conflictingField) {
            throw new Error(`Database "${payload.name}": Cannot use both legacy password policy field "${conflictingField}" and "password_options". Please migrate fully to "password_options".`);
        }
        const complexity = options.password_options?.complexity;
        if (complexity?.character_type_rule === 'three_of_four') {
            const allTypes = ['uppercase', 'lowercase', 'number', 'special'];
            const hasAllTypes = allTypes.every((t) => complexity?.character_types?.includes(t));
            if (!hasAllTypes) {
                throw new Error(`Database "${payload.name}": "character_type_rule" can only be set to "three_of_four" when all four character types (uppercase, lowercase, number, special) are specified in "character_types".`);
            }
        }
        const blockedFields = options.password_options?.profile_data?.blocked_fields;
        if (blockedFields) {
            if (blockedFields.length > 12) {
                throw new Error(`Database "${payload.name}": "profile_data.blocked_fields" cannot contain more than 12 items.`);
            }
            const tooLong = blockedFields.find((f) => f.length > 100);
            if (tooLong) {
                throw new Error(`Database "${payload.name}": Each item in "profile_data.blocked_fields" must not exceed 100 characters.`);
            }
        }
    }
    validatePasswordlessSettings(payload) {
        const options = payload?.options;
        if (!options)
            return;
        const passwordEnabled = options?.authentication_methods?.password?.enabled;
        const disableSelfServiceChangePassword = options?.disable_self_service_change_password;
        if (passwordEnabled === undefined || disableSelfServiceChangePassword === undefined)
            return;
        if (passwordEnabled === false && disableSelfServiceChangePassword !== true) {
            throw new Error(`Database "${payload.name}": When password authentication is disabled, disable_self_service_change_password must be true.`);
        }
        if (passwordEnabled === true && disableSelfServiceChangePassword === true) {
            throw new Error(`Database "${payload.name}": disable_self_service_change_password must be false when password authentication is enabled.`);
        }
        const apiBehavior = options?.authentication_methods?.password?.api_behavior;
        const signupBehavior = options?.authentication_methods?.password?.signup_behavior;
        if (signupBehavior === 'block' && apiBehavior !== 'optional') {
            throw new Error(`Database "${payload.name}": When "signup_behavior" is "block", "api_behavior" must be "optional".`);
        }
    }
    validateEmailUniqueConstraints(payload) {
        const attributes = payload?.options?.attributes;
        // Only validate if attributes are present
        if (!attributes)
            return;
        const emailAttributes = attributes.email;
        const usernameAttributes = attributes.username;
        const phoneAttributes = attributes.phone_number;
        // At least one identifier must always be active
        const hasAnyActiveIdentifier = emailAttributes?.identifier?.active === true ||
            usernameAttributes?.identifier?.active === true ||
            phoneAttributes?.identifier?.active === true;
        if (!hasAnyActiveIdentifier) {
            throw new Error(`Database "${payload.name}": At least one identifier must be active. Either email.identifier.active, username.identifier.active, or phone_number.identifier.active must be set to true.`);
        }
        if (emailAttributes?.unique === false) {
            // When email.unique = false, email.identifier.active cannot be true
            if (emailAttributes?.identifier?.active === true) {
                throw new Error(`Database "${payload.name}": Cannot set email.identifier.active to true when email.unique is false. Non-unique emails cannot be used as active identifiers.`);
            }
        }
    }
    getClientFN(fn) {
        // Override this as a database is actually a connection but we are treating them as a different object
        if (fn === 'create') {
            return (payload) => {
                // Remove deprecated enabled_clients field
                if ('enabled_clients' in payload)
                    delete payload.enabled_clients;
                return this.client.connections.create(payload);
            };
        }
        // If we going to update database, we need to get current options first
        if (fn === 'update') {
            return (id, payload) => this.client.connections.get(id).then((response) => {
                const connection = response;
                const attributes = payload?.options?.attributes;
                const requiresUsername = payload?.options?.requires_username;
                const validation = payload?.options?.validation;
                if (attributes && (requiresUsername || validation)) {
                    logger_1.default.warn('Warning: "attributes" cannot be used with "requires_username" or "validation". Please remove one of the conflicting options.');
                }
                else if (attributes) {
                    delete connection.options?.validation;
                    delete connection.options?.requires_username;
                }
                else if (requiresUsername || validation) {
                    delete connection.options?.attributes;
                }
                // When switching between flexible and legacy password policy, strip the conflicting
                // group from the existing state before merging to avoid a 400 from the API.
                const payloadHasPasswordOptions = !!payload?.options?.password_options;
                const payloadHasLegacyPasswordFields = payload?.options?.passwordPolicy ||
                    payload?.options?.password_complexity_options ||
                    payload?.options?.password_history ||
                    payload?.options?.password_no_personal_info ||
                    payload?.options?.password_dictionary;
                if (payloadHasPasswordOptions) {
                    delete connection.options?.passwordPolicy;
                    delete connection.options?.password_complexity_options;
                    delete connection.options?.password_history;
                    delete connection.options?.password_no_personal_info;
                    delete connection.options?.password_dictionary;
                }
                else if (payloadHasLegacyPasswordFields) {
                    delete connection.options?.password_options;
                }
                // If signup_behavior is being set to "block", api_behavior must be "optional".
                // Check the merged result upfront so the user gets a clear error rather than a
                // cryptic 400 from the API.
                const mergedApiBehavior = payload?.options?.authentication_methods?.password?.api_behavior ??
                    connection.options?.authentication_methods?.password?.api_behavior;
                const payloadSignupBehavior = payload?.options?.authentication_methods?.password?.signup_behavior;
                if (payloadSignupBehavior === 'block' && mergedApiBehavior !== 'optional') {
                    throw new Error(`Database "${payload.name}": Cannot set "signup_behavior" to "block" without "api_behavior" set to "optional". ` +
                        `The existing tenant value for "api_behavior" is "${mergedApiBehavior ?? 'required (default)'}". ` +
                        `Please explicitly set "api_behavior" to "optional" in your config.`);
                }
                payload.options = { ...connection.options, ...payload.options };
                if (payload.options && Object.keys(payload.options).length === 0) {
                    delete payload.options;
                }
                // Remove deprecated enabled_clients field
                if ('enabled_clients' in payload)
                    delete payload.enabled_clients;
                return this.client.connections.update(id, payload);
            });
        }
        return this.client.connections[fn].bind(this.client.connections);
    }
    async getType() {
        if (this.existing)
            return this.existing;
        // Fetch connections and actions concurrently
        const [connections, actions] = await Promise.all([
            (0, client_1.paginate)(this.client.connections.list, {
                strategy: [auth0_1.Management.ConnectionStrategyEnum.Auth0],
                checkpoint: true,
            }),
            (0, client_1.paginate)(this.client.actions.list, {
                paginate: true,
                include_totals: true,
            }),
        ]);
        const dbConnectionsWithEnabledClients = await Promise.all(connections.map(async (con) => {
            if (!con?.id)
                return con;
            const enabledClients = await (0, connections_1.getConnectionEnabledClients)(this.client, con.id);
            const connection = { ...con };
            if (enabledClients && enabledClients?.length) {
                connection.enabled_clients = enabledClients;
            }
            return connection;
        }));
        // Convert action ID back to action name for export
        const dbConnectionsWithActionNames = dbConnectionsWithEnabledClients.map((connection) => {
            if (connection.options && 'custom_password_hash' in connection.options) {
                const customPasswordHash = connection.options?.custom_password_hash;
                if (customPasswordHash?.action_id) {
                    return {
                        ...connection,
                        options: {
                            ...connection.options,
                            custom_password_hash: {
                                ...customPasswordHash,
                                action_id: (0, utils_1.convertActionIdToName)(customPasswordHash.action_id, actions),
                            },
                        },
                    };
                }
            }
            return connection;
        });
        // If options option is empty for all connection, log the missing options scope.
        const isOptionExists = dbConnectionsWithActionNames.every((c) => c.options && Object.keys(c.options).length > 0);
        if (!isOptionExists) {
            logger_1.default.warn(`Insufficient scope the read:connections_options scope is required to get ${this.type} options.`);
        }
        this.existing = dbConnectionsWithActionNames;
        return this.existing;
    }
    async calcChanges(assets) {
        const { databases } = assets;
        // Do nothing if not set
        if (!databases)
            return {
                del: [],
                create: [],
                update: [],
                conflicts: [],
            };
        // Convert enabled_clients by name to the id
        // Fetch clients, connections, and actions concurrently
        const [clients, existingDatabasesConnections, actions] = await Promise.all([
            (0, client_1.paginate)(this.client.clients.list, {
                paginate: true,
            }),
            (0, client_1.paginate)(this.client.connections.list, {
                strategy: [auth0_1.Management.ConnectionStrategyEnum.Auth0],
                checkpoint: true,
                include_totals: true,
            }),
            (0, client_1.paginate)(this.client.actions.list, {
                paginate: true,
                include_totals: true,
            }),
        ]);
        const formatted = databases.map((db) => {
            const { options, ...rest } = db;
            const formattedOptions = this.getFormattedOptions(options, actions);
            const formattedDb = { ...rest, options: formattedOptions };
            if (db.enabled_clients) {
                formattedDb.enabled_clients = (0, utils_1.getEnabledClients)(assets, db, existingDatabasesConnections, clients);
            }
            return formattedDb;
        });
        return super.calcChanges({ ...assets, databases: formatted });
    }
    async dryRunChanges(assets) {
        const { databases } = assets;
        if (!databases) {
            return {
                del: [],
                create: [],
                update: [],
                conflicts: [],
            };
        }
        const [clients, existingDatabasesConnections, actions] = await Promise.all([
            (0, client_1.paginate)(this.client.clients.list, {
                paginate: true,
            }),
            (0, client_1.paginate)(this.client.connections.list, {
                strategy: [auth0_1.Management.ConnectionStrategyEnum.Auth0],
                checkpoint: true,
                include_totals: true,
            }),
            (0, client_1.paginate)(this.client.actions.list, {
                paginate: true,
                include_totals: true,
            }),
        ]);
        const formatted = databases.map((db) => {
            const { options, ...rest } = db;
            const formattedOptions = this.getFormattedOptions(options, actions);
            const formattedDb = { ...rest, options: formattedOptions };
            if (db.enabled_clients) {
                formattedDb.enabled_clients = (0, utils_1.getEnabledClients)(assets, db, existingDatabasesConnections, clients);
            }
            return formattedDb;
        });
        return (0, calculateDryRunChanges_1.calculateDryRunChanges)({
            type: this.type,
            assets: formatted,
            existing: existingDatabasesConnections,
            identifiers: this.identifiers,
            ignoreDryRunFields: this.ignoreDryRunFields,
        });
    }
    // Run after clients are updated so we can convert all the enabled_clients names to id's
    async processChanges(assets) {
        const { databases } = assets;
        // Do nothing if not set
        if (!databases)
            return;
        // If options option is empty for all connection, log the missing options scope.
        const isOptionExists = databases.every((c) => c.options && Object.keys(c.options).length > 0);
        if (!isOptionExists) {
            logger_1.default.warn(`Insufficient scope the update:connections_options scope is required to update ${this.type} options.`);
        }
        const excludedConnections = (assets.exclude && assets.exclude.databases) || [];
        const changes = await this.calcChanges(assets);
        await super.processChanges(assets, (0, utils_1.filterExcluded)(changes, excludedConnections));
        // process enabled clients
        await (0, connections_1.processConnectionEnabledClients)(this.client, this.type, await this.existing, (0, utils_1.filterExcluded)(changes, excludedConnections));
    }
}
exports.default = DatabaseHandler;
__decorate([
    (0, default_1.order)('60')
], DatabaseHandler.prototype, "processChanges", null);
