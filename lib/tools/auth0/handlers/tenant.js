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
exports.removeUnallowedTenantFlags = exports.allowedTenantFlags = exports.schema = void 0;
const lodash_1 = require("lodash");
const nconf_1 = __importDefault(require("nconf"));
const validationError_1 = __importDefault(require("../../validationError"));
const default_1 = __importStar(require("./default"));
const pages_1 = require("./pages");
const utils_1 = require("../../utils");
const logger_1 = __importDefault(require("../../../logger"));
const sessionDurationsToMinutes_1 = __importDefault(require("../../../sessionDurationsToMinutes"));
const tokenQuotaConfigurationSchema = {
    type: 'object',
    properties: {
        client_credentials: {
            type: 'object',
            properties: {
                enforce: {
                    type: 'boolean',
                    default: true,
                },
                per_day: {
                    type: 'integer',
                    minimum: 1,
                },
                per_hour: {
                    type: 'integer',
                    minimum: 1,
                },
            },
            additionalProperties: false,
            minProperties: 1,
        },
    },
    required: ['client_credentials'],
};
exports.schema = {
    type: 'object',
    properties: {
        client_id_metadata_document_supported: {
            type: 'boolean',
            description: 'Whether the authorization server supports retrieving client metadata from a client_id URL.',
        },
        default_token_quota: {
            type: 'object',
            properties: {
                clients: tokenQuotaConfigurationSchema,
                organizations: tokenQuotaConfigurationSchema,
            },
            additionalProperties: false,
            minProperties: 1,
        },
        skip_non_verifiable_callback_uri_confirmation_prompt: {
            type: ['boolean', 'null'],
            description: 'Whether to skip the confirmation prompt for non-verifiable callback URIs',
        },
        resource_parameter_profile: {
            type: 'string',
            enum: ['audience', 'compatibility'],
            description: 'OAuth resource parameter compatibility mode for specifying the protected resource.',
        },
        dynamic_client_registration_security_mode: {
            type: 'string',
            enum: ['strict', 'permissive'],
            description: 'Indicates the security mode for new clients created through the Dynamic Client Registration endpoint.',
        },
    },
};
const blockPageKeys = [
    ...Object.keys(pages_1.pageNameMap),
    ...Object.values(pages_1.pageNameMap),
    ...pages_1.supportedPages,
];
/*
 Tenant flags are used to facilitate a number of functionalities, some
 public, some internal. The subset of flags that are allowed to be updated
 in the context of the Deploy CLI is based on wether they're publicly exposed
 in the Auth0 API docs:

 https://auth0.com/docs/api/management/v2#!/Tenants/patch_settings
*/
exports.allowedTenantFlags = [
    'change_pwd_flow_v1',
    'enable_client_connections',
    'enable_apis_section',
    'enable_pipeline2',
    'enable_dynamic_client_registration',
    'enable_custom_domain_in_emails',
    'allow_legacy_tokeninfo_endpoint',
    'enable_legacy_profile',
    'enable_idtoken_api2',
    'enable_public_signup_user_exists_error',
    'allow_legacy_delegation_grant_types',
    'allow_legacy_ro_grant_types',
    'enable_sso',
    'disable_clickjack_protection_headers',
    'no_disclose_enterprise_connections',
    'disable_management_api_sms_obfuscation',
    'enforce_client_authentication_on_passwordless_start',
    'trust_azure_adfs_email_verified_connection_property',
    'enable_adfs_waad_email_verification',
    'revoke_refresh_token_grant',
    'dashboard_log_streams_next',
    'dashboard_insights_view',
    'disable_fields_map_fix',
    'require_pushed_authorization_requests',
    'mfa_show_factor_list_on_enrollment',
    'improved_signup_bot_detection_in_classic',
];
const removeUnallowedTenantFlags = (proposedFlags) => {
    if (proposedFlags === undefined)
        return {};
    const removedFlags = [];
    const filteredFlags = Object.keys(proposedFlags).reduce((acc, proposedKey) => {
        const isAllowedFlag = exports.allowedTenantFlags.includes(proposedKey);
        if (!isAllowedFlag) {
            removedFlags.push(proposedKey);
            return acc;
        }
        return {
            ...acc,
            [proposedKey]: proposedFlags[proposedKey],
        };
    }, {});
    if (removedFlags.length > 0) {
        const logMsg = `The following tenant flag${removedFlags.length > 1 ? 's have not been' : ' has not been'} updated because deemed incompatible with the target tenant: ${removedFlags.join(', ')}
      ${removedFlags.length > 1 ? 'These flags' : 'This flag'} can likely be removed from the tenant definition file. If you believe this removal is an error, please report via a Github issue.`;
        if (nconf_1.default.get('AUTH0_DRY_RUN')) {
            logger_1.default.debug(logMsg);
        }
        else {
            logger_1.default.warn(logMsg);
        }
    }
    return filteredFlags;
};
exports.removeUnallowedTenantFlags = removeUnallowedTenantFlags;
class TenantHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'tenant',
        });
    }
    async getType() {
        const tenant = await this.client.tenants.settings.get();
        tenant.flags = (0, exports.removeUnallowedTenantFlags)(tenant.flags);
        this.existing = tenant;
        blockPageKeys.forEach((key) => {
            if (tenant[key])
                delete tenant[key];
        });
        return tenant;
    }
    async validate(assets) {
        const { tenant } = assets;
        // Nothing to validate?
        if (!tenant)
            return;
        const pageKeys = Object.keys(tenant).filter((k) => blockPageKeys.includes(k));
        if (pageKeys.length > 0) {
            throw new validationError_1.default(`The following pages ${(0, utils_1.convertJsonToString)(pageKeys)} were found in tenant settings. Pages should be set separately. Please refer to the documentation.`);
        }
    }
    // Run after other updates so objected can be referenced such as default directory
    async processChanges(assets) {
        const { tenant } = assets;
        // Do nothing if not set
        if (!tenant)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { update } = await this.calcChanges(assets);
            if (update.length === 0) {
                return;
            }
        }
        const updatedTenant = {
            ...tenant,
            flags: tenant.flags
                ? (0, exports.removeUnallowedTenantFlags)(tenant.flags)
                : undefined,
        };
        if ('flags' in updatedTenant) {
            if (updatedTenant.flags === undefined || Object.keys(updatedTenant.flags).length === 0) {
                delete updatedTenant.flags;
            }
        }
        if (tenant.flags?.enable_custom_domain_in_emails !== undefined) {
            logger_1.default.warn('The "enable_custom_domain_in_emails" tenant flag is deprecated. ' +
                'Use the "is_default" field on customDomains to configure the default domain instead. ' +
                'The flag will still be applied for now but will be removed in a future release.');
        }
        if (updatedTenant && Object.keys(updatedTenant).length > 0) {
            const sessionDurations = (0, sessionDurationsToMinutes_1.default)({
                session_lifetime: updatedTenant?.session_lifetime,
                idle_session_lifetime: updatedTenant?.idle_session_lifetime,
                ephemeral_session_lifetime: updatedTenant?.ephemeral_session_lifetime,
                idle_ephemeral_session_lifetime: updatedTenant?.idle_ephemeral_session_lifetime,
            });
            let updateTenantPayload = updatedTenant;
            if (!(0, lodash_1.isEmpty)(sessionDurations)) {
                updateTenantPayload = { ...updateTenantPayload, ...sessionDurations };
                // context: https://github.com/auth0/auth0-deploy-cli/pull/471
                delete updateTenantPayload.session_lifetime;
                delete updateTenantPayload.idle_session_lifetime;
                delete updateTenantPayload.ephemeral_session_lifetime;
                delete updateTenantPayload.idle_ephemeral_session_lifetime;
            }
            await this.client.tenants.settings.update(updateTenantPayload);
            this.updated += 1;
            this.didUpdate(updateTenantPayload);
        }
    }
}
exports.default = TenantHandler;
__decorate([
    (0, default_1.order)('100')
], TenantHandler.prototype, "processChanges", null);
