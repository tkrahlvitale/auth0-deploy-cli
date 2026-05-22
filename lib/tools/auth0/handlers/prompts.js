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
const lodash_1 = require("lodash");
const auth0_1 = require("auth0");
const default_1 = __importStar(require("./default"));
const types_1 = require("../../../types");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
const client_1 = require("../client");
const promptTypes = [
    'login',
    'login-id',
    'login-password',
    'login-passwordless',
    'login-email-verification',
    'signup',
    'signup-id',
    'signup-password',
    'phone-identifier-enrollment',
    'phone-identifier-challenge',
    'email-identifier-challenge',
    'reset-password',
    'custom-form',
    'consent',
    'customized-consent',
    'logout',
    'mfa-push',
    'mfa-otp',
    'mfa-voice',
    'mfa-phone',
    'mfa-webauthn',
    'mfa-sms',
    'mfa-email',
    'mfa-recovery-code',
    'mfa',
    'status',
    'device-flow',
    'email-verification',
    'email-otp-challenge',
    'organizations',
    'invitation',
    'common',
    'captcha',
    'passkeys',
    'brute-force-protection',
];
const screenTypes = [
    'login',
    'login-id',
    'login-password',
    'login-email-verification',
    'signup',
    'signup-id',
    'signup-password',
    'reset-password-request',
    'reset-password-email',
    'reset-password',
    'reset-password-success',
    'reset-password-error',
    'consent',
    'status',
    'mfa-detect-browser-capabilities',
    'mfa-enroll-result',
    'mfa-login-options',
    'mfa-begin-enroll-options',
    'mfa-otp-enrollment-qr',
    'mfa-otp-enrollment-code',
    'mfa-otp-challenge',
    'mfa-voice-challenge',
    'mfa-sms-challenge',
    'mfa-recovery-code-enrollment',
    'mfa-recovery-code-challenge',
    'mfa-country-codes',
    'mfa-sms-enrollment',
    'mfa-voice-enrollment',
    'mfa-phone-challenge',
    'mfa-phone-enrollment',
    'mfa-webauthn-roaming-enrollment',
    'mfa-webauthn-platform-enrollment',
    'mfa-webauthn-platform-challenge',
    'mfa-webauthn-roaming-challenge',
    'mfa-webauthn-change-key-nickname',
    'mfa-webauthn-enrollment-success',
    'mfa-webauthn-error',
    'mfa-webauthn-not-available-error',
    'mfa-sms-list',
    'mfa-email-challenge',
    'mfa-email-list',
    'mfa-push-welcome',
    'mfa-push-list',
    'mfa-push-enrollment-qr',
    'mfa-push-enrollment-code',
    'mfa-push-success',
    'mfa-push-challenge-push',
    'device-code-activation',
    'device-code-activation-allowed',
    'device-code-activation-denied',
    'device-code-confirmation',
    'email-verification-result',
    'email-otp-challenge',
    'redeem-ticket',
    'organization-selection',
    'pre-login-organization-picker',
    'accept-invitation',
    'login-passwordless-email-code',
    'login-passwordless-email-link',
    'login-passwordless-sms-otp',
    'passkey-enrollment',
    'passkey-enrollment-local',
    'brute-force-protection-unblock',
    'brute-force-protection-unblock-success',
    'brute-force-protection-unblock-failure',
];
const customPartialsPromptTypes = [
    'login',
    'login-id',
    'login-password',
    'login-passwordless',
    'signup',
    'signup-id',
    'signup-password',
    'passkeys',
];
// Prompts that may not be available on all tenants (early access features)
const optionalPartialsPromptTypes = ['passkeys'];
const customPartialsScreenTypes = [
    'login',
    'login-id',
    'login-password',
    'signup',
    'signup-id',
    'signup-password',
    'login-passwordless-sms-otp',
    'login-passwordless-email-code',
    'passkeys-enrollment',
    'passkeys-enrollment-local',
];
const customPartialsInsertionPoints = [
    'form-content-start',
    'form-content-end',
    'form-footer-start',
    'form-footer-end',
    'secondary-actions-start',
    'secondary-actions-end',
];
exports.schema = {
    type: 'object',
    properties: {
        universal_login_experience: {
            type: 'string',
            enum: ['new', 'classic'],
        },
        webauthn_platform_first_factor: {
            type: 'boolean',
        },
        identifier_first: {
            type: 'boolean',
        },
        customText: {
            type: 'object',
            properties: types_1.languages.reduce((acc, language) => ({
                ...acc,
                [language]: {
                    type: 'object',
                    properties: promptTypes.reduce((promptAcc, promptType) => ({
                        ...promptAcc,
                        [promptType]: {
                            type: 'object',
                            properties: screenTypes.reduce((screenAcc, screenType) => ({
                                ...screenAcc,
                                [screenType]: {
                                    type: 'object',
                                },
                            }), {}),
                        },
                    }), {}),
                },
            }), {}),
        },
        partials: {
            type: 'object',
            properties: customPartialsPromptTypes.reduce((acc, customPartialsPromptType) => ({
                ...acc,
                [customPartialsPromptType]: {
                    oneOf: [
                        {
                            type: 'object',
                            properties: customPartialsScreenTypes.reduce((screenAcc, customPartialsScreenType) => ({
                                ...screenAcc,
                                [customPartialsScreenType]: {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            properties: customPartialsInsertionPoints.reduce((insertionAcc, customPartialsInsertionPoint) => ({
                                                ...insertionAcc,
                                                [customPartialsInsertionPoint]: {
                                                    type: 'string',
                                                },
                                            }), {}),
                                        },
                                        { type: 'null' },
                                    ],
                                },
                            }), {}),
                        },
                        { type: 'null' },
                    ],
                },
            }), {}),
        },
        screenRenderers: {
            type: 'array',
            properties: promptTypes.reduce((promptAcc, promptType) => ({
                ...promptAcc,
                [promptType]: {
                    type: 'array',
                    properties: screenTypes.reduce((screenAcc, screenType) => ({
                        ...screenAcc,
                        [screenType]: {
                            type: 'string',
                        },
                    }), {}),
                },
            }), {}),
        },
    },
};
class PromptsHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'prompts',
        });
        this.IsFeatureSupported = true;
    }
    objString({ customText, screenRenderers }) {
        let description = 'Prompts settings';
        if (customText) {
            description += ' and prompts custom text';
        }
        if (screenRenderers && screenRenderers.length > 0) {
            description += ' and screen renderers';
        }
        return description;
    }
    async getType() {
        const promptsSettings = await this.client.prompts.getSettings();
        const customText = await this.getCustomTextSettings();
        const partials = await this.getCustomPromptsPartials();
        const prompts = {
            ...promptsSettings,
            customText,
            partials,
        };
        try {
            const screenRenderers = await (0, client_1.paginate)(this.client.prompts.rendering.list, {
                paginate: true,
            });
            prompts.screenRenderers = screenRenderers ?? [];
        }
        catch (error) {
            logger_1.default.warn(`Unable to fetch screen renderers: ${error}`);
        }
        return prompts;
    }
    async getCustomTextSettings() {
        const supportedLanguages = await this.client.tenants.settings.get().then((res) => {
            if (res.enabled_locales === undefined)
                return []; // In rare cases, private cloud tenants may not have `enabled_locales` defined
            return res.enabled_locales;
        });
        return this.client.pool
            .addEachTask({
            data: supportedLanguages
                .map((language) => promptTypes.map((promptType) => ({ promptType, language })))
                .reduce((acc, val) => acc.concat(val), []) || [],
            generator: ({ promptType, language }) => this.client.prompts.customText.get(promptType, language).then((customTextData) => {
                if ((0, lodash_1.isEmpty)(customTextData))
                    return null;
                return {
                    language,
                    [promptType]: {
                        ...customTextData,
                    },
                };
            }),
        })
            .promise()
            .then((customTextResponse) => customTextResponse
            .filter((customTextData) => customTextData !== null)
            .reduce((acc, customTextItem) => {
            if (customTextItem?.language === undefined)
                return acc;
            const { language, ...customTextSettings } = customTextItem;
            return {
                ...acc,
                [language]: acc[language]
                    ? { ...acc[language], ...customTextSettings }
                    : { ...customTextSettings },
            };
        }, {}));
    }
    /**
     * Error handler wrapper.
     */
    async withErrorHandling(callback) {
        try {
            return await callback();
        }
        catch (error) {
            // Extract error data
            if (error && error?.statusCode === 403) {
                logger_1.default.warn('Partial Prompts feature is not supported for the tenant');
                this.IsFeatureSupported = false;
                return null;
            }
            if (error &&
                error?.statusCode === 400 &&
                error.message?.includes('feature requires at least one custom domain')) {
                logger_1.default.warn('Partial Prompts feature requires at least one custom domain to be configured for the tenant');
                this.IsFeatureSupported = false;
                return null;
            }
            // Handle 400 errors for prompt types not available on all tenants (early access features)
            // Error format: "Path validation error: 'Invalid value \"passkeys\"' on property prompt (Name of the prompt)."
            if (error &&
                error?.statusCode === 400 &&
                error.message?.includes('Path validation error') &&
                error.message?.includes('on property prompt')) {
                // Check if the error message contains any of the optional prompt types
                const unavailablePrompt = optionalPartialsPromptTypes.find((promptType) => error.message?.includes(promptType));
                if (unavailablePrompt) {
                    logger_1.default.warn(`Skipping partials for prompt type '${unavailablePrompt}' because it is not available on this tenant.`);
                    return null;
                }
            }
            if (error && error.statusCode === 429) {
                logger_1.default.error(`The global rate limit has been exceeded, resulting in a ${error.statusCode} error. ${error.message}. Although this is an error, it is not blocking the pipeline.`);
                return null;
            }
            throw error;
        }
    }
    async getCustomPartial({ prompt, }) {
        if (!this.IsFeatureSupported)
            return {};
        return this.withErrorHandling(async () => this.client.prompts.partials.get(prompt));
    }
    async getCustomPromptsPartials() {
        const partialsDataWithNulls = await this.client.pool
            .addEachTask({
            data: customPartialsPromptTypes,
            generator: (promptType) => this.getCustomPartial({
                prompt: promptType,
            }).then((partialsData) => {
                if ((0, lodash_1.isEmpty)(partialsData))
                    return null;
                return { promptType, partialsData };
            }),
        })
            .promise();
        const validPartialsData = partialsDataWithNulls.filter(Boolean);
        return validPartialsData.reduce((acc, partialData) => {
            if (partialData) {
                const { promptType, partialsData } = partialData;
                acc[promptType] = partialsData;
            }
            return acc;
        }, {});
    }
    async processChanges(assets) {
        const { prompts } = assets;
        if (!prompts)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        const { partials, customText, screenRenderers, ...promptSettings } = prompts;
        if (!(0, lodash_1.isEmpty)(promptSettings)) {
            await this.client.prompts.updateSettings(promptSettings);
        }
        await this.updateCustomTextSettings(customText);
        await this.updateCustomPromptsPartials(partials);
        // Update screen renderers
        await this.updateScreenRenderers(screenRenderers);
        this.updated += 1;
        this.didUpdate(prompts);
    }
    async updateCustomTextSettings(customText) {
        /*
          Note: deletes are not currently supported
        */
        if (!customText)
            return;
        await this.client.pool
            .addEachTask({
            data: Object.keys(customText).flatMap((language) => {
                const languageScreenTypes = customText[language];
                if (!languageScreenTypes)
                    return [];
                return Object.keys(languageScreenTypes).map((prompt) => {
                    const body = languageScreenTypes[prompt] || {};
                    return {
                        body,
                        language,
                        prompt,
                    };
                });
            }),
            generator: ({ prompt, language, body }) => this.client.prompts.customText.set(prompt, language, body),
        })
            .promise();
    }
    async updateCustomPartials({ prompt, body, }) {
        if (!this.IsFeatureSupported)
            return;
        await this.withErrorHandling(async () => this.client.prompts.partials.set(prompt, body));
    }
    async updateCustomPromptsPartials(partials) {
        /*
          Note: deletes are not currently supported
        */
        if (!partials)
            return;
        await this.client.pool
            .addEachTask({
            data: Object.keys(partials).map((prompt) => {
                const body = partials[prompt] || {};
                return {
                    body,
                    prompt,
                };
            }),
            generator: ({ prompt, body }) => this.updateCustomPartials({ prompt, body }),
        })
            .promise();
    }
    async updateScreenRenderer(screenRenderer) {
        const { prompt, screen, ...updatePrams } = screenRenderer;
        if (!prompt || !screen)
            return;
        let updatePayload;
        if (screenRenderer.rendering_mode === auth0_1.Management.AculRenderingModeEnum.Standard) {
            updatePayload = {
                rendering_mode: auth0_1.Management.AculRenderingModeEnum.Standard,
                head_tags: screenRenderer.head_tags,
            };
        }
        else {
            updatePayload = {
                ...updatePrams,
                rendering_mode: auth0_1.Management.AculRenderingModeEnum.Advanced,
                default_head_tags_disabled: screenRenderer.default_head_tags_disabled || undefined,
                head_tags: screenRenderer.head_tags,
            };
        }
        try {
            await this.client.prompts.rendering.update(prompt, screen, {
                ...updatePayload,
            });
        }
        catch (error) {
            const errorMessage = `Problem updating ${this.type} screen renderers  ${prompt}:${screen}\n${error}`;
            logger_1.default.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
    async updateScreenRenderers(screenRenderers) {
        if ((0, lodash_1.isEmpty)(screenRenderers) || !screenRenderers)
            return;
        await this.client.pool
            .addEachTask({
            data: screenRenderers,
            generator: (updateParams) => this.updateScreenRenderer(updateParams),
        })
            .promise();
    }
}
exports.default = PromptsHandler;
__decorate([
    (0, default_1.order)('80')
], PromptsHandler.prototype, "processChanges", null);
