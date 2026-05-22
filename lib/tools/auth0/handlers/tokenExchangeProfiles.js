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
const default_1 = __importStar(require("./default"));
const client_1 = require("../client");
const logger_1 = __importDefault(require("../../../logger"));
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'The name of the token exchange profile',
            },
            subject_token_type: {
                type: 'string',
                description: 'The URI representing the subject token type',
            },
            action: {
                type: 'string',
                description: 'The name of the action associated with this profile',
            },
            type: {
                type: 'string',
                enum: ['custom_authentication'],
                description: 'The type of token exchange profile',
            },
        },
        required: ['name', 'subject_token_type', 'action', 'type'],
    },
};
class TokenExchangeProfilesHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'tokenExchangeProfiles',
            id: 'id',
            identifiers: ['id', 'subject_token_type'],
            // Only name and subject_token_type can be updated
            stripUpdateFields: ['created_at', 'updated_at', 'action_id', 'type'],
            stripCreateFields: ['created_at', 'updated_at'],
        });
    }
    sanitizeForExport(profile, actions) {
        if (profile.action_id) {
            const action = actions?.find((a) => a.id === profile.action_id);
            if (action) {
                const { action_id, ...rest } = profile;
                return { ...rest, action: action.name };
            }
            else {
                logger_1.default.warn(`Token exchange profile "${profile.name}" references action with ID "${profile.action_id}" which was not found`);
            }
        }
        return profile;
    }
    sanitizeForAPI(profile, actions) {
        if (profile.action) {
            const foundAction = actions?.find((a) => a.name === profile.action);
            if (foundAction) {
                const { action, ...rest } = profile;
                return { ...rest, action_id: foundAction.id };
            }
            else {
                throw new Error(`Token exchange profile "${profile.name}" references action "${profile.action}" which was not found`);
            }
        }
        if (!profile.action_id) {
            throw new Error(`Token exchange profile "${profile.name}" is missing action reference. ` +
                `Expected "action" (name) or "action_id" (ID) field.`);
        }
        return profile;
    }
    async getActions() {
        if (this.actions)
            return this.actions;
        this.actions = await (0, client_1.paginate)(this.client.actions.list, {
            paginate: true,
        });
        return this.actions;
    }
    async getType() {
        if (this.existing)
            return this.existing;
        try {
            // Fetch all token exchange profiles
            const profiles = await (0, client_1.paginate)(this.client.tokenExchangeProfiles.list, {
                paginate: true,
            });
            // Fetch all actions to map action_id to action name
            this.actions = await this.getActions();
            // Map action_id to action name for each profile
            this.existing = profiles.map((profile) => this.sanitizeForExport(profile, this.actions ?? []));
            return this.existing;
        }
        catch (err) {
            if (err.statusCode === 403) {
                logger_1.default.warn('Token Exchange Profiles feature is not available on this tenant. Please contact Auth0 support to enable this feature.');
                return [];
            }
            throw err;
        }
    }
    async processChanges(assets) {
        const { tokenExchangeProfiles } = assets;
        // Do nothing if not set
        if (!tokenExchangeProfiles)
            return;
        // Calculate changes
        const { del, update, create, conflicts } = await this.calcChanges(assets);
        logger_1.default.debug(`Start processChanges for tokenExchangeProfiles [delete:${del.length}] [update:${update.length}], [create:${create.length}], [conflicts:${conflicts.length}]`);
        // Fetch actions to resolve action names to IDs
        if (!this.actions || this.actions.length === 0) {
            this.actions = await this.getActions();
        }
        // Process changes in order: delete, create, update
        if (del.length > 0) {
            await this.deleteTokenExchangeProfiles(del.map((profile) => this.sanitizeForAPI(profile, this.actions ?? [])));
        }
        if (create.length > 0) {
            await this.createTokenExchangeProfiles(create.map((profile) => this.sanitizeForAPI(profile, this.actions ?? [])));
        }
        if (update.length > 0) {
            await this.updateTokenExchangeProfiles(update.map((profile) => this.sanitizeForAPI(profile, this.actions ?? [])));
        }
    }
    async createTokenExchangeProfile(profile) {
        if (!profile.name || !profile.subject_token_type || !profile.action_id || !profile.type) {
            throw new Error(`Cannot create token exchange profile missing required fields`);
        }
        const createParams = {
            name: profile.name,
            subject_token_type: profile.subject_token_type,
            action_id: profile.action_id,
            type: profile.type,
        };
        const created = await this.client.tokenExchangeProfiles.create(createParams);
        return created;
    }
    async createTokenExchangeProfiles(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createTokenExchangeProfile(item)
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
    async updateTokenExchangeProfile(profile) {
        const { id, name, subject_token_type } = profile;
        if (!id) {
            throw new Error(`Cannot update token exchange profile "${profile.name}" - missing id`);
        }
        const updateParams = {
            name,
            subject_token_type,
        };
        await this.client.tokenExchangeProfiles.update(id, updateParams);
    }
    async updateTokenExchangeProfiles(updates) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updateTokenExchangeProfile(item)
                .then(() => {
                this.didUpdate(item);
                this.updated += 1;
            })
                .catch((err) => {
                throw new Error(`Problem updating ${this.type} ${this.objString(item)}\n${err}`);
            }),
        })
            .promise();
    }
    async deleteTokenExchangeProfile(profile) {
        if (!profile.id) {
            throw new Error(`Cannot delete token exchange profile "${profile.name}" - missing id`);
        }
        await this.client.tokenExchangeProfiles.delete(profile.id);
    }
    async deleteTokenExchangeProfiles(data) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: data || [],
                generator: (item) => this.deleteTokenExchangeProfile(item)
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
            logger_1.default.warn(`Detected the following tokenExchangeProfile should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${data.map((i) => this.objString(i)).join('\n')}`);
        }
    }
}
exports.default = TokenExchangeProfilesHandler;
__decorate([
    (0, default_1.order)('65')
], TokenExchangeProfilesHandler.prototype, "processChanges", null);
