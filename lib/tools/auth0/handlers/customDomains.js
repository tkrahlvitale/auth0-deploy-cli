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
const validationError_1 = __importDefault(require("../../validationError"));
const logger_1 = __importDefault(require("../../../logger"));
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            custom_domain_id: { type: 'string' },
            custom_client_ip_header: {
                type: 'string',
                nullable: true,
                enum: ['true-client-ip', 'cf-connecting-ip', 'x-forwarded-for', null],
            },
            domain: { type: 'string' },
            primary: { type: 'boolean' },
            status: { type: 'string' },
            type: { type: 'string', enum: ['auth0_managed_certs', 'self_managed_certs'] },
            verification: { type: 'object' },
            tls_policy: {
                type: 'string',
                description: 'Custom domain TLS policy. Must be `recommended`, includes TLS 1.2.',
                defaultValue: 'recommended',
            },
            domain_metadata: {
                type: 'object',
                description: 'Domain metadata associated with the custom domain.',
                defaultValue: undefined,
                maxProperties: 10,
            },
            verification_method: {
                type: 'string',
                description: 'Custom domain verification method. Must be `txt`.',
                defaultValue: 'txt',
            },
            relying_party_identifier: {
                type: ['string'],
                description: 'Relying Party ID (rpId) to be used for Passkeys on this custom domain. If not provided or set to null, the full domain will be used.',
            },
            is_default: {
                type: 'boolean',
                description: 'Whether this custom domain is the default domain used for email notifications.',
            },
        },
        required: ['domain', 'type'],
    },
};
class CustomDomainsHadnler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'customDomains',
            id: 'custom_domain_id',
            identifiers: ['custom_domain_id', 'domain'],
            stripCreateFields: [
                'status',
                'primary',
                'verification',
                'certificate',
                'created_at',
                'updated_at',
                'is_default',
            ],
            stripUpdateFields: [
                'status',
                'primary',
                'verification',
                'type',
                'domain',
                'verification_method',
                'certificate',
                'created_at',
                'updated_at',
                'is_default',
            ],
        });
    }
    objString(item) {
        return super.objString(item.domain);
    }
    async getType() {
        try {
            if (this.existing) {
                return this.existing;
            }
            const customDomains = await this.client.customDomains.list();
            this.existing = customDomains;
            return customDomains;
        }
        catch (err) {
            if (err.statusCode === 403 &&
                err.message ===
                    'The account is not allowed to perform this operation, please contact our support team') {
                return null;
            }
            throw err;
        }
    }
    async validate(assets) {
        await super.validate(assets);
        const { customDomains } = assets;
        if (!customDomains)
            return;
        const defaultDomains = customDomains.filter((d) => d.is_default === true);
        if (defaultDomains.length > 1) {
            throw new validationError_1.default(`Only one custom domain can be set as default (is_default: true), but found ${defaultDomains.length}: ${defaultDomains.map((d) => d.domain).join(', ')}`);
        }
    }
    async processChanges(assets) {
        const { customDomains } = assets;
        if (!customDomains)
            return;
        // Deprecation warnings for custom domains
        if (customDomains.some((customDomain) => customDomain.primary != null)) {
            logger_1.default.warn('The "primary" field is deprecated and may be removed in future versions for "customDomains"');
        }
        if (customDomains.some((customDomain) => 'verification_method' in customDomain)) {
            logger_1.default.warn('The "verification_method" field is deprecated and may be removed in future versions for "customDomains"');
        }
        const changes = await this.calcChanges(assets);
        await super.processChanges(assets, changes);
        // If a domain is marked as is_default, set it as the tenant's default custom domain.
        const defaultDomain = customDomains.find((d) => d.is_default === true);
        if (defaultDomain) {
            try {
                await this.client.customDomains.setDefault({ domain: defaultDomain.domain });
                logger_1.default.info(`Set default custom domain: ${defaultDomain.domain}`);
            }
            catch (err) {
                throw new Error(`Problem setting default custom domain ${defaultDomain.domain}\n${err}`);
            }
        }
    }
}
exports.default = CustomDomainsHadnler;
__decorate([
    (0, default_1.order)('50')
], CustomDomainsHadnler.prototype, "processChanges", null);
