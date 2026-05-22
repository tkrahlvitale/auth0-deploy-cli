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
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
const TwilioConfigurationSchema = {
    type: 'object',
    required: ['sid', 'delivery_methods'],
    additionalProperties: false,
    properties: {
        default_from: {
            type: 'string',
        },
        mssid: {
            type: 'string',
        },
        sid: {
            type: 'string',
        },
        delivery_methods: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['text', 'voice'],
            },
            minItems: 1,
            uniqueItems: true,
        },
    },
};
const CustomCredentialsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {},
};
const CustomConfigurationSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['delivery_methods'],
    properties: {
        delivery_methods: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['text', 'voice'],
            },
            minItems: 1,
            uniqueItems: true,
        },
    },
};
const TwilioCredentialsSchema = {
    type: 'object',
    required: ['auth_token'],
    properties: {
        auth_token: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
        },
    },
    additionalProperties: false,
};
exports.schema = {
    type: 'array',
    description: 'List of phone provider configurations',
    items: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
            },
            name: {
                type: 'string',
                description: 'Name of the phone notification provider',
                enum: ['twilio', 'custom'],
                minLength: 1,
                maxLength: 100,
            },
            disabled: {
                type: 'boolean',
                description: 'Whether the provider is enabled (false) or disabled (true).',
                defaultValue: false,
            },
            configuration: {
                type: 'object',
                anyOf: [TwilioConfigurationSchema, CustomConfigurationSchema],
            },
            credentials: {
                description: 'Provider credentials required to authenticate to the provider.',
                anyOf: [TwilioCredentialsSchema, CustomCredentialsSchema],
            },
        },
        additionalProperties: false,
    },
};
class PhoneProviderHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'phoneProviders',
            id: 'id',
        });
    }
    objString(provider) {
        return super.objString({ name: provider.name, disabled: provider.disabled });
    }
    async getType() {
        if (!this.existing) {
            this.existing = await this.getPhoneProviders();
        }
        return this.existing;
    }
    async getPhoneProviders() {
        const response = await this.client.branding.phone.providers.list();
        return response.providers ?? [];
    }
    async processChanges(assets) {
        const { phoneProviders } = assets;
        // Non-existing section means themes doesn't need to be processed
        if (!phoneProviders)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        // Empty array means themes should be deleted
        if (phoneProviders.length === 0) {
            await this.deletePhoneProviders();
        }
        else {
            await this.updatePhoneProviders(phoneProviders);
        }
    }
    async deletePhoneProviders() {
        if (!this.config('AUTH0_ALLOW_DELETE')) {
            return;
        }
        // if phone providers exists we need to delete it
        const currentProviders = await this.getPhoneProviders();
        if (currentProviders === null || currentProviders.length === 0) {
            return;
        }
        const currentProvider = currentProviders[0];
        if (!currentProvider.id) {
            throw new Error('Unable to find phone provider id when trying to delete');
        }
        await this.client.branding.phone.providers.delete(currentProvider.id);
        this.deleted += 1;
        this.didDelete(currentProvider);
    }
    async updatePhoneProviders(phoneProviders) {
        if (phoneProviders.length > 1) {
            logger_1.default.warn('Currently only one phone provider is supported per tenant');
        }
        const currentProviders = await this.getPhoneProviders();
        const providerReqPayload = (() => {
            // Removing id from update and create payloads, otherwise API will error
            // id may be required to handle if `--export_ids=true`
            const payload = phoneProviders[0];
            if (payload && 'id' in payload) {
                delete payload.id;
            }
            return payload;
        })();
        if (currentProviders === null || currentProviders.length === 0) {
            // if provider does not exist, create it
            this.created += 1;
            await this.client.branding.phone.providers.create(providerReqPayload);
        }
        else {
            const currentProvider = currentProviders[0];
            if (!currentProvider.id) {
                throw new Error('Unable to find phone provider id when trying to delete');
            }
            // if provider exists, overwrite it
            await this.client.branding.phone.providers.update(currentProvider.id, providerReqPayload);
            this.updated += 1;
            this.didUpdate(phoneProviders[0]);
        }
    }
}
exports.default = PhoneProviderHandler;
__decorate([
    (0, default_1.order)('60')
], PhoneProviderHandler.prototype, "processChanges", null);
