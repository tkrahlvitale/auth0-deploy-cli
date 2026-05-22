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
exports.schema = {
    type: 'array',
    description: 'List of phone notification templates',
    items: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                description: 'Type of phone notification template',
                enum: ['otp_verify', 'otp_enroll', 'change_password', 'blocked_account', 'password_breach'],
            },
            disabled: {
                type: 'boolean',
                description: 'Whether the template is enabled (false) or disabled (true).',
            },
            content: {
                type: 'object',
                description: 'Content of the phone template',
                properties: {
                    syntax: {
                        type: 'string',
                        description: 'Syntax used for the template content',
                    },
                    from: {
                        type: 'string',
                        description: 'Default phone number to be used as "from" when sending a phone notification',
                    },
                    body: {
                        type: 'object',
                        description: 'Body content of the phone template',
                        properties: {
                            text: {
                                type: 'string',
                                description: 'Content of the phone template for text notifications',
                            },
                            voice: {
                                type: 'string',
                                description: 'Content of the phone template for voice notifications',
                            },
                        },
                    },
                },
            },
        },
    },
};
class PhoneTemplatesHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'phoneTemplates',
            identifiers: ['type'],
            stripCreateFields: ['channel', 'customizable', 'tenant'],
            stripUpdateFields: ['channel', 'customizable', 'tenant', 'type'],
        });
    }
    objString(template) {
        return super.objString({ type: template.type, disabled: template.disabled });
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        const response = await this.client.branding.phone.templates.list();
        this.existing = response.templates ?? [];
        return this.existing;
    }
    async processChanges(assets) {
        const { phoneTemplates } = assets;
        if (!phoneTemplates)
            return;
        const { del, update, create } = await this.calcChanges(assets);
        logger_1.default.debug(`Start processChanges for phone templates [delete:${del.length}] [update:${update.length}], [create:${create.length}]`);
        if (del.length > 0) {
            await this.deletePhoneTemplates(del);
        }
        if (create.length > 0) {
            await this.createPhoneTemplates(create);
        }
        if (update.length > 0) {
            await this.updatePhoneTemplates(update);
        }
    }
    async createPhoneTemplate(template) {
        const created = await this.client.branding.phone.templates.create(template);
        return created;
    }
    async createPhoneTemplates(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createPhoneTemplate(item)
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
    async updatePhoneTemplate(template) {
        const { type } = template;
        // Find the existing template to get its id
        const existing = this.existing?.find((t) => t.type === type);
        if (!existing?.id) {
            logger_1.default.warn(`Skipping update for phone template type '${type}' as unable to find existing template ID`);
            return template;
        }
        // stripUpdateFields does not support in sub modules
        const stripUpdateFields = ['content.syntax'];
        logger_1.default.debug(`Stripping ${this.type} create-only fields ${JSON.stringify(stripUpdateFields)}`);
        const updatePayload = {
            content: {
                from: template.content?.from,
                body: {
                    text: template.content?.body?.text,
                    voice: template.content?.body?.voice,
                },
            },
            disabled: template.disabled,
        };
        const updated = await this.client.branding.phone.templates.update(existing.id, updatePayload);
        return updated;
    }
    async updatePhoneTemplates(updates) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updatePhoneTemplate(item)
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
    async deletePhoneTemplate(template) {
        if (!template.id) {
            throw new Error(`Unable to find phone template id for type ${template.type} when trying to delete`);
        }
        await this.client.branding.phone.templates.delete(template.id);
    }
    async deletePhoneTemplates(data) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: data || [],
                generator: (item) => this.deletePhoneTemplate(item)
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
            logger_1.default.warn(`Detected the following phone templates should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${data.map((i) => this.objString(i)).join('\n')}`);
        }
    }
}
exports.default = PhoneTemplatesHandler;
__decorate([
    (0, default_1.order)('65')
], PhoneTemplatesHandler.prototype, "processChanges", null);
