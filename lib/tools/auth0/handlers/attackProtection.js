"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.CAPTCHA_PROVIDERS = void 0;
const default_1 = __importDefault(require("./default"));
const utils_1 = require("../../utils");
const logger_1 = __importDefault(require("../../../logger"));
exports.CAPTCHA_PROVIDERS = [
    'arkose',
    'auth_challenge',
    'friendly_captcha',
    'hcaptcha',
    'recaptcha_v2',
    'recaptcha_enterprise',
    'simple_captcha',
];
exports.schema = {
    type: 'object',
    properties: {
        botDetection: {
            type: 'object',
            properties: {
                bot_detection_level: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'The level of bot detection sensitivity',
                },
                challenge_password_policy: {
                    type: 'string',
                    enum: ['never', 'when_risky', 'always'],
                    description: 'The policy that defines how often to show CAPTCHA for password flows',
                },
                challenge_passwordless_policy: {
                    type: 'string',
                    enum: ['never', 'when_risky', 'always'],
                    description: 'The policy that defines how often to show CAPTCHA for passwordless flows',
                },
                challenge_password_reset_policy: {
                    type: 'string',
                    enum: ['never', 'when_risky', 'always'],
                    description: 'The policy that defines how often to show CAPTCHA for password reset flows',
                },
                allowlist: {
                    type: 'array',
                    items: {
                        type: 'string',
                        description: 'IP address (IPv4 or IPv6) or CIDR block',
                    },
                    description: 'List of IP addresses or CIDR blocks to allowlist',
                },
                monitoring_mode_enabled: {
                    type: 'boolean',
                    description: 'Whether monitoring mode is enabled (logs but does not block)',
                },
            },
        },
        breachedPasswordDetection: {
            type: 'object',
        },
        bruteForceProtection: {
            type: 'object',
        },
        captcha: {
            type: 'object',
            properties: {
                active_provider_id: {
                    type: 'string',
                    description: 'The id of the active provider for the CAPTCHA.',
                    enum: exports.CAPTCHA_PROVIDERS,
                },
                arkose: {
                    type: 'object',
                    properties: {
                        site_key: {
                            type: 'string',
                            description: 'The site key for the Arkose captcha provider.',
                        },
                        secret: {
                            type: 'string',
                            description: 'The secret key for the Arkose captcha provider.',
                        },
                        client_subdomain: {
                            type: 'string',
                            description: 'The subdomain used for client requests to the Arkose captcha provider.',
                        },
                        verify_subdomain: {
                            type: 'string',
                            description: 'The subdomain used for server-side verification requests to the Arkose captcha provider.',
                        },
                        fail_open: {
                            type: 'boolean',
                            description: 'Whether the captcha should fail open.',
                        },
                    },
                    required: ['site_key', 'secret'],
                    additionalProperties: false,
                },
                auth_challenge: {
                    type: 'object',
                    properties: {
                        fail_open: {
                            type: 'boolean',
                            description: 'Whether the auth challenge should fail open.',
                        },
                    },
                    required: ['fail_open'],
                    additionalProperties: false,
                },
                hcaptcha: {
                    type: 'object',
                    properties: {
                        site_key: {
                            type: 'string',
                            description: 'The site key for the hCaptcha provider.',
                        },
                        secret: {
                            type: 'string',
                            description: 'The secret key for the hCaptcha provider.',
                        },
                    },
                    required: ['site_key', 'secret'],
                    additionalProperties: false,
                },
                friendly_captcha: {
                    type: 'object',
                    properties: {
                        site_key: {
                            type: 'string',
                            description: 'The site key for the Friendly Captcha provider.',
                        },
                        secret: {
                            type: 'string',
                            description: 'The secret key for the Friendly Captcha provider.',
                        },
                    },
                    required: ['site_key', 'secret'],
                    additionalProperties: false,
                },
                recaptcha_enterprise: {
                    type: 'object',
                    properties: {
                        site_key: {
                            type: 'string',
                            description: 'The site key for the reCAPTCHA Enterprise provider.',
                        },
                        api_key: {
                            type: 'string',
                            description: 'The API key for the reCAPTCHA Enterprise provider.',
                        },
                        project_id: {
                            type: 'string',
                            description: 'The project ID for the reCAPTCHA Enterprise provider.',
                        },
                    },
                    required: ['site_key', 'api_key', 'project_id'],
                    additionalProperties: false,
                },
                recaptcha_v2: {
                    type: 'object',
                    properties: {
                        site_key: {
                            type: 'string',
                            description: 'The site key for the reCAPTCHA v2 provider.',
                        },
                        secret: {
                            type: 'string',
                            description: 'The secret key for the reCAPTCHA v2 provider.',
                        },
                    },
                    required: ['site_key', 'secret'],
                    additionalProperties: false,
                },
                simple_captcha: {
                    type: 'object',
                },
            },
        },
        suspiciousIpThrottling: {
            type: 'object',
        },
    },
    additionalProperties: false,
};
class AttackProtectionHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'attackProtection',
            ignoreDryRunFields: [
                'captcha.arkose.secret',
                'captcha.friendly_captcha.secret',
                'captcha.hcaptcha.secret',
                'captcha.recaptcha_enterprise.api_key',
                'captcha.recaptcha_enterprise.project_id',
                'captcha.recaptcha_v2.secret',
            ],
        });
    }
    objString(item) {
        const objectString = (() => {
            const obj = {};
            if (item.botDetection) {
                obj['bot-detection'] = {
                    bot_detection_level: item.botDetection.bot_detection_level,
                    monitoring_mode_enabled: item.botDetection.monitoring_mode_enabled,
                };
            }
            if (item.breachedPasswordDetection?.enabled) {
                obj['breached-password-protection'] = {
                    enabled: item.breachedPasswordDetection.enabled,
                };
            }
            if (item.bruteForceProtection?.enabled) {
                obj['brute-force-protection'] = {
                    enabled: item.bruteForceProtection.enabled,
                };
            }
            if (item.captcha) {
                obj.captcha = {
                    active_provider_id: item.captcha.active_provider_id,
                };
            }
            if (item.suspiciousIpThrottling?.enabled) {
                obj['suspicious-ip-throttling'] = {
                    enabled: item.suspiciousIpThrottling.enabled,
                };
            }
            return obj;
        })();
        return super.objString(objectString);
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        const [breachedPasswordDetection, bruteForceProtection, suspiciousIpThrottling] = await Promise.all([
            this.client.attackProtection.breachedPasswordDetection.get(),
            this.client.attackProtection.bruteForceProtection.get(),
            this.client.attackProtection.suspiciousIpThrottling.get(),
        ]);
        let botDetection = null;
        let captcha = null;
        try {
            [botDetection, captcha] = await Promise.all([
                this.client.attackProtection.botDetection.get(),
                this.client.attackProtection.captcha.get(),
            ]);
        }
        catch (err) {
            if (err.statusCode === 403) {
                logger_1.default.warn('Bot Detection API are not enabled for this tenant. Please verify `scope` or contact Auth0 support to enable this feature.');
            }
        }
        const attackProtection = {
            breachedPasswordDetection: breachedPasswordDetection,
            bruteForceProtection: bruteForceProtection,
            suspiciousIpThrottling: suspiciousIpThrottling,
        };
        if (botDetection) {
            attackProtection.botDetection = botDetection;
        }
        if (captcha) {
            attackProtection.captcha = captcha;
        }
        this.existing = attackProtection;
        return this.existing;
    }
    async processChanges(assets) {
        const { attackProtection } = assets;
        if (!attackProtection || !Object.keys(attackProtection).length) {
            return;
        }
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        const updates = [];
        if (attackProtection.botDetection && Object.keys(attackProtection.botDetection).length) {
            updates.push(this.client.attackProtection.botDetection.update(attackProtection.botDetection));
        }
        if (attackProtection.breachedPasswordDetection) {
            updates.push(this.client.attackProtection.breachedPasswordDetection.update(attackProtection.breachedPasswordDetection));
        }
        if (attackProtection.captcha && Object.keys(attackProtection.captcha).length) {
            const { captcha } = attackProtection;
            // remove empty CAPTCHA provider configurations before updates to prevent API errors
            exports.CAPTCHA_PROVIDERS.forEach((provider) => {
                if (provider in captcha) {
                    const providerConfig = captcha[provider];
                    const isEmpty = provider === 'auth_challenge' || provider === 'simple_captcha'
                        ? Object.keys(providerConfig).length === 0
                        : !providerConfig?.site_key || providerConfig.site_key === '';
                    if (isEmpty) {
                        delete captcha[provider];
                    }
                }
            });
            attackProtection.captcha = captcha;
            updates.push(this.client.attackProtection.captcha.update(attackProtection.captcha));
        }
        if (attackProtection.bruteForceProtection) {
            updates.push(this.client.attackProtection.bruteForceProtection.update(attackProtection.bruteForceProtection));
        }
        if (attackProtection.suspiciousIpThrottling) {
            updates.push(this.client.attackProtection.suspiciousIpThrottling.update(attackProtection.suspiciousIpThrottling));
        }
        if (!updates.length) {
            return;
        }
        await Promise.all(updates);
        this.updated += 1;
        this.didUpdate(attackProtection);
    }
}
exports.default = AttackProtectionHandler;
