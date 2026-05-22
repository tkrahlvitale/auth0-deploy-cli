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
const lodash_1 = require("lodash");
const logger_1 = __importDefault(require("../../../logger"));
const default_1 = __importStar(require("./default"));
const client_1 = require("../client");
const utils_1 = require("../../utils");
const userAttributeProfiles_1 = require("./userAttributeProfiles");
const SelfServiceProfileCustomTextLanguageEnum = {
    en: 'en',
};
const SelfServiceProfileCustomTextPageEnum = {
    getStarted: 'get-started',
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
            description: {
                type: 'string',
            },
            user_attributes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        is_optional: {
                            type: 'boolean',
                        },
                    },
                },
            },
            allowed_strategies: {
                type: 'array',
                description: 'List of IdP strategies that will be shown to users during the Self-Service SSO flow.',
                items: {
                    type: 'string',
                    enum: Object.values(auth0_1.Management.SelfServiceProfileAllowedStrategyEnum),
                },
            },
            branding: {
                type: 'object',
                properties: {
                    logo_url: {
                        type: 'string',
                    },
                    colors: {
                        type: 'object',
                        properties: {
                            primary: {
                                type: 'string',
                            },
                        },
                        required: ['primary'],
                    },
                },
            },
            customText: {
                type: 'object',
                properties: {
                    [SelfServiceProfileCustomTextLanguageEnum.en]: {
                        type: 'object',
                        properties: {
                            [SelfServiceProfileCustomTextPageEnum.getStarted]: {
                                type: 'object',
                            },
                        },
                    },
                },
            },
            user_attribute_profile_id: {
                type: 'string',
            },
        },
        required: ['name'],
    },
};
class SelfServiceProfileHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'selfServiceProfiles',
            id: 'id',
            stripCreateFields: ['created_at', 'updated_at'],
            stripUpdateFields: ['created_at', 'updated_at'],
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
        const selfServiceProfiles = await (0, client_1.paginate)(this.client.selfServiceProfiles.list, {
            paginate: true,
        });
        const selfServiceProfileWithCustomText = await Promise.all(selfServiceProfiles.map(async (sp) => {
            /**
             * Fetches the custom text for the "get_started" in "en" page of a self-service profile.
             */
            const getStartedText = await this.client.selfServiceProfiles.customText.list(sp.id, SelfServiceProfileCustomTextLanguageEnum.en, SelfServiceProfileCustomTextPageEnum.getStarted);
            if (!(0, lodash_1.isEmpty)(getStartedText)) {
                const customText = {
                    [SelfServiceProfileCustomTextLanguageEnum.en]: {
                        [SelfServiceProfileCustomTextPageEnum.getStarted]: getStartedText,
                    },
                };
                return {
                    ...sp,
                    customText,
                };
            }
            return sp;
        }));
        this.existing = selfServiceProfileWithCustomText;
        return this.existing;
    }
    // Run after UserAttributeProfiles so that we can handle converting any `user_attribute_profile_id` names to IDs
    async processChanges(assets) {
        let { selfServiceProfiles } = assets;
        // Do nothing if not set
        if (!selfServiceProfiles)
            return;
        const userAttributeProfiles = await this.getUserAttributeProfiles(this.client, selfServiceProfiles);
        selfServiceProfiles = selfServiceProfiles.map((ssProfile) => {
            if (this.hasConflictingUserAttribute(ssProfile)) {
                logger_1.default.error(`Self Service Profile ${ssProfile.name} has conflicting properties user_attribute_profile_id and user_attributes. Please remove one.`);
                throw new Error(`Self Service Profile ${ssProfile.name} has conflicting properties user_attribute_profile_id and user_attributes. Please remove one.`);
            }
            // don't process if no user_attribute_profile_id
            if (!ssProfile.user_attribute_profile_id)
                return ssProfile;
            const profile = { ...ssProfile };
            const found = userAttributeProfiles.find((uap) => uap.name === profile.user_attribute_profile_id);
            if (found) {
                profile.user_attribute_profile_id = found.id;
            }
            else {
                logger_1.default.error(`User Attribute ${profile.user_attribute_profile_id} not found for Self Service Profile ${profile.name}. Please verify the User Attribute Profile Name.`);
                throw new Error(`User Attribute ${profile.user_attribute_profile_id} not found for Self Service Profile ${profile.name}. Please verify the User Attribute Profile Name.`);
            }
            return profile;
        });
        const { del, update, create } = await this.calcChanges({ ...assets, selfServiceProfiles });
        if ((0, utils_1.isDryRun)(this.config)) {
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        logger_1.default.debug(`Start processChanges for selfServiceProfiles [delete:${del.length}] [update:${update.length}], [create:${create.length}]`);
        const myChanges = [{ del: del }, { create: create }, { update: update }];
        await Promise.all(myChanges.map(async (change) => {
            switch (true) {
                case change.del && change.del.length > 0:
                    await this.deleteSelfServiceProfiles(change.del || []);
                    break;
                case change.create && change.create.length > 0:
                    await this.createSelfServiceProfiles(change.create);
                    break;
                case change.update && change.update.length > 0:
                    if (change.update)
                        await this.updateSelfServiceProfiles(change.update);
                    break;
                default:
                    break;
            }
        }));
    }
    async updateCustomText(ssProfileId, customText) {
        try {
            await this.client.selfServiceProfiles.customText.set(ssProfileId, SelfServiceProfileCustomTextLanguageEnum.en, SelfServiceProfileCustomTextPageEnum.getStarted, {
                ...customText[SelfServiceProfileCustomTextLanguageEnum.en][SelfServiceProfileCustomTextPageEnum.getStarted],
            });
            logger_1.default.debug(`Updated custom text for ${this.type} ${ssProfileId}`);
        }
        catch (err) {
            logger_1.default.error(`Problem updating custom text for ${this.type} ${ssProfileId}\n${err}`);
            throw new Error(`Problem updating custom text for ${this.type} ${ssProfileId}\n${err}`);
        }
    }
    async createSelfServiceProfiles(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createSelfServiceProfile(item)
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
    async createSelfServiceProfile(profile) {
        const { customText, ...ssProfile } = profile;
        const created = await this.client.selfServiceProfiles.create(ssProfile);
        if (!(0, lodash_1.isEmpty)(customText) && created.id) {
            await this.updateCustomText(created.id, customText);
        }
        return created;
    }
    async updateSelfServiceProfiles(updates) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updateSelfServiceProfile(item)
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
    async updateSelfServiceProfile(profile) {
        const { customText, id, ...ssProfile } = profile;
        const updated = await this.client.selfServiceProfiles.update(id, ssProfile);
        if (!(0, lodash_1.isEmpty)(customText) && updated.id) {
            await this.updateCustomText(updated.id, customText);
        }
        return updated;
    }
    async deleteSelfServiceProfiles(deletes) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: deletes || [],
                generator: (item) => this.deleteSelfServiceProfile(item)
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
            logger_1.default.warn(`Detected the following selfServiceProfile should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
            \n${deletes.map((i) => this.objString(i)).join('\n')}`);
        }
    }
    async deleteSelfServiceProfile(profile) {
        await this.client.selfServiceProfiles.delete(profile.id);
    }
    async getUserAttributeProfiles(auth0Client, selfServiceProfiles) {
        if (selfServiceProfiles.some((p) => p.user_attribute_profile_id && p.user_attribute_profile_id.trim() !== '')) {
            return (0, userAttributeProfiles_1.getUserAttributeProfiles)(auth0Client);
        }
        return [];
    }
    hasConflictingUserAttribute(profile) {
        // If both user_attribute_profile_id and user_attributes are set and have values then error
        if (profile.user_attribute_profile_id &&
            profile.user_attribute_profile_id.trim() !== '' &&
            profile.user_attributes &&
            profile.user_attributes.length > 0) {
            return true;
        }
        return false;
    }
}
exports.default = SelfServiceProfileHandler;
__decorate([
    (0, default_1.order)('60')
], SelfServiceProfileHandler.prototype, "processChanges", null);
