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
exports.getUserAttributeProfiles = exports.schema = void 0;
const default_1 = __importStar(require("./default"));
const logger_1 = __importDefault(require("../../../logger"));
const client_1 = require("../client");
const utils_1 = require("../../utils");
const strategies = ['pingfederate', 'ad', 'adfs', 'waad', 'google-apps', 'okta', 'oidc', 'samlp'];
const strategyOverrides = {
    type: 'object',
    additionalProperties: false,
    properties: strategies.reduce((acc, curr) => ({
        ...acc,
        [curr]: {
            type: 'object',
            additionalProperties: false,
            properties: {
                oidc_mapping: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['mapping'],
                    properties: {
                        mapping: {
                            type: 'string',
                        },
                        display_name: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 50,
                        },
                    },
                },
                saml_mapping: {
                    type: 'array',
                    items: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 128,
                    },
                    minItems: 1,
                    maxItems: 3,
                    uniqueItems: true,
                },
                scim_mapping: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 128,
                },
            },
        },
    }), {}),
};
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            user_id: {
                type: 'object',
                properties: {
                    oidc_mapping: {
                        type: 'string',
                        enum: ['sub'],
                        default: 'sub',
                    },
                    saml_mapping: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        minItems: 1,
                        maxItems: 3,
                    },
                    scim_mapping: {
                        type: 'string',
                        default: 'externalId',
                    },
                    strategy_overrides: {
                        type: 'object',
                        properties: strategies.reduce((acc, curr) => ({
                            ...acc,
                            [curr]: {
                                type: 'object',
                                additionalProperties: false,
                                properties: {
                                    oidc_mapping: {
                                        type: 'string',
                                        enum: ['sub', 'oid', 'email'],
                                        minLength: 1,
                                        maxLength: 50,
                                    },
                                    saml_mapping: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                        },
                                        minItems: 1,
                                        maxItems: 3,
                                    },
                                    scim_mapping: {
                                        type: 'string',
                                    },
                                },
                            },
                        }), {}),
                    },
                },
            },
            user_attributes: {
                type: 'object',
                minProperties: 1,
                maxProperties: 64,
                additionalProperties: {
                    type: 'object',
                    required: ['description', 'label', 'profile_required', 'auth0_mapping'],
                    additionalProperties: false,
                    properties: {
                        description: {
                            description: 'Description of this attribute',
                            type: 'string',
                            minLength: 1,
                            maxLength: 128,
                        },
                        label: {
                            description: 'Display label for this attribute',
                            type: 'string',
                            minLength: 1,
                            maxLength: 128,
                        },
                        profile_required: {
                            description: 'Whether this attribute is required in the profile',
                            type: 'boolean',
                        },
                        auth0_mapping: {
                            description: 'Auth0 mapping for this attribute',
                            type: 'string',
                            minLength: 1,
                            maxLength: 50,
                        },
                        oidc_mapping: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['mapping'],
                            properties: {
                                mapping: {
                                    type: 'string',
                                },
                                display_name: {
                                    description: 'Display name for the OIDC mapping',
                                    type: 'string',
                                    minLength: 1,
                                    maxLength: 50,
                                },
                            },
                        },
                        saml_mapping: {
                            type: 'array',
                            items: {
                                description: 'SAML mapping field',
                                type: 'string',
                                minLength: 1,
                                maxLength: 128,
                            },
                            minItems: 1,
                            maxItems: 3,
                            uniqueItems: true,
                        },
                        scim_mapping: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 128,
                        },
                        strategy_overrides: strategyOverrides,
                    },
                },
            },
        },
    },
};
const getUserAttributeProfiles = async (auth0Client) => {
    try {
        const userAttributeProfiles = await (0, client_1.paginate)(auth0Client.userAttributeProfiles.list, {
            checkpoint: true,
            include_totals: true,
            is_global: false,
            take: 10,
        });
        return userAttributeProfiles;
    }
    catch (err) {
        if (err.statusCode === 404 || err.statusCode === 501) {
            return [];
        }
        if (err.statusCode === 403) {
            logger_1.default.debug('User Attribute Profile with Self-Service SSO is not enabled for this tenant. Please verify `scope` or contact Auth0 support to enable this feature.');
            return [];
        }
        throw err;
    }
};
exports.getUserAttributeProfiles = getUserAttributeProfiles;
class UserAttributeProfilesHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'userAttributeProfiles',
            id: 'id',
            identifiers: ['id', 'name'],
            stripUpdateFields: ['id'],
        });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        this.existing = await (0, exports.getUserAttributeProfiles)(this.client);
        return this.existing;
    }
    async processChanges(assets) {
        const { userAttributeProfiles } = assets;
        // Do nothing if not set
        if (!userAttributeProfiles)
            return;
        const { del, update, create, conflicts } = await this.calcChanges(assets);
        if ((0, utils_1.isDryRun)(this.config)) {
            if (create.length === 0 &&
                update.length === 0 &&
                del.length === 0 &&
                conflicts.length === 0) {
                return;
            }
        }
        const changes = {
            del,
            update,
            create,
            conflicts,
        };
        logger_1.default.debug(`Start processChanges for userAttributeProfile [delete:${changes.del.length}] [update:${changes.update.length}], [create:${changes.create.length}]`);
        await super.processChanges(assets, changes);
    }
}
exports.default = UserAttributeProfilesHandler;
__decorate([
    (0, default_1.order)('50')
], UserAttributeProfilesHandler.prototype, "processChanges", null);
