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
const constants_1 = __importDefault(require("../../constants"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
exports.schema = {
    type: 'object',
    properties: {
        templates: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    template: { type: 'string' },
                    body: { type: 'string' },
                },
            },
        },
    },
};
class BrandingHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'branding',
        });
    }
    async getType() {
        let branding = {};
        try {
            branding = await this.client.branding.get();
            const customDomains = await this.client.customDomains.list();
            // templates are only supported if there's custom domains.
            if (customDomains && customDomains.length) {
                let payload = await this.client.branding.templates.getUniversalLogin();
                payload = payload;
                if (Object.keys(branding).length === 0) {
                    branding = {
                        templates: [
                            {
                                template: constants_1.default.UNIVERSAL_LOGIN_TEMPLATE,
                                body: payload.body,
                            },
                        ],
                    };
                }
                else {
                    branding = {
                        ...branding,
                        templates: [
                            {
                                template: constants_1.default.UNIVERSAL_LOGIN_TEMPLATE,
                                body: payload.body,
                            },
                        ],
                    };
                }
            }
            return branding;
        }
        catch (err) {
            logger_1.default.debug(`Error calling branding API, ${err.message}, status code: ${err.statusCode}`);
            if (err.statusCode === 403) {
                logger_1.default.warn('Insufficient scope the read:custom_domains scope is not set. Branding templates will not be exported.');
                return branding;
            }
            if (err.statusCode === 404)
                return branding;
            if (err.statusCode === 501)
                return branding;
            throw err;
        }
    }
    async processChanges(assets) {
        if (!assets.branding)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (del.length === 0 && update.length === 0 && create.length === 0) {
                return;
            }
        }
        const { templates, ...brandingSettings } = assets.branding;
        if (brandingSettings.logo_url === '') {
            // Sometimes blank logo_url returned by API but is invalid on import. See: DXCDT-240
            delete brandingSettings.logo_url;
        }
        if (brandingSettings && Object.keys(brandingSettings).length) {
            await this.client.branding.update(brandingSettings);
            this.updated += 1;
            this.didUpdate(brandingSettings);
        }
        // handle templates
        if (templates && templates.length) {
            const unknownTemplates = templates
                .filter((t) => !constants_1.default.SUPPORTED_BRANDING_TEMPLATES.includes(t.template))
                .map((t) => t.template);
            if (unknownTemplates.length) {
                // throw a helpful warning for unknown templates, the context handlers are unaware of which are supported, that's all handled here.
                logger_1.default.warn(`Found unknown branding template(s): ${unknownTemplates
                    .join()
                    .toString()}. Supported branding templates are: ${constants_1.default.SUPPORTED_BRANDING_TEMPLATES.join()}.`);
            }
            const templateDefinition = templates.find((t) => t.template === constants_1.default.UNIVERSAL_LOGIN_TEMPLATE);
            if (templateDefinition && templateDefinition.body) {
                await this.client.branding.templates.updateUniversalLogin({
                    template: templateDefinition.body,
                });
                this.updated += 1;
                this.didUpdate(templates);
            }
        }
    }
}
exports.default = BrandingHandler;
__decorate([
    (0, default_1.order)('70') // Run after custom domains and themes.
], BrandingHandler.prototype, "processChanges", null);
