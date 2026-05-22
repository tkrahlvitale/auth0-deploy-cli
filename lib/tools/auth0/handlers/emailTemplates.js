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
exports.schema = exports.supportedTemplates = void 0;
const default_1 = __importStar(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const utils_1 = require("../../utils");
exports.supportedTemplates = constants_1.default.EMAIL_TEMPLATES_NAMES.filter((p) => p.includes('.json')).map((p) => p.replace('.json', ''));
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            template: { type: 'string', enum: exports.supportedTemplates },
            body: { type: 'string', default: '' },
        },
        required: ['template'],
    },
};
class EmailTemplateHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'emailTemplates',
            identifiers: ['template'],
        });
    }
    objString(item) {
        return super.objString({
            template: item.template,
            enabled: item.enabled,
        });
    }
    async getType() {
        const emailTemplates = await Promise.all(constants_1.default.EMAIL_TEMPLATES_TYPES.map(async (templateName) => {
            try {
                const template = await this.client.emailTemplates.get(templateName);
                return template;
            }
            catch (err) {
                if (err.statusCode === 403 && templateName === constants_1.default.EMAIL_ASYNC_APPROVAL) {
                    // Ignore if feature_not_enabled
                    return null;
                }
                // Ignore if not found, else throw error
                if (err.statusCode !== 404) {
                    throw err;
                }
            }
            return null;
        }));
        const nonEmptyTemplates = emailTemplates.filter((template) => !!template);
        return nonEmptyTemplates;
    }
    async updateOrCreate(emailTemplate) {
        try {
            const identifierField = this.identifiers[0];
            const params = { templateName: emailTemplate[identifierField] };
            const updated = await this.client.emailTemplates.update(params.templateName, emailTemplate);
            // Remove body from the response
            const { body, ...excludedBody } = updated;
            this.didUpdate(excludedBody);
            this.updated += 1;
        }
        catch (err) {
            if (err.statusCode === 404) {
                // Create if it does not exist
                const created = await this.client.emailTemplates.create(emailTemplate);
                // Remove body from the response
                const { body, ...excludedBody } = created;
                this.didCreate(excludedBody);
                this.created += 1;
            }
            else {
                throw err;
            }
        }
    }
    // Run after email provider changes
    async processChanges(assets) {
        const { emailTemplates } = assets;
        // Do nothing if not set
        if (!emailTemplates || !emailTemplates.length)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0) {
                return;
            }
        }
        await Promise.all(emailTemplates.map(async (emailTemplate) => {
            await this.updateOrCreate(emailTemplate);
        }));
    }
}
exports.default = EmailTemplateHandler;
__decorate([
    (0, default_1.order)('70')
], EmailTemplateHandler.prototype, "processChanges", null);
