import DefaultAPIHandler from './default';
import { Asset, Assets } from '../../../types';
export declare const CAPTCHA_PROVIDERS: string[];
export declare const schema: {
    type: string;
    properties: {
        botDetection: {
            type: string;
            properties: {
                bot_detection_level: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                challenge_password_policy: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                challenge_passwordless_policy: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                challenge_password_reset_policy: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                allowlist: {
                    type: string;
                    items: {
                        type: string;
                        description: string;
                    };
                    description: string;
                };
                monitoring_mode_enabled: {
                    type: string;
                    description: string;
                };
            };
        };
        breachedPasswordDetection: {
            type: string;
        };
        bruteForceProtection: {
            type: string;
        };
        captcha: {
            type: string;
            properties: {
                active_provider_id: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                arkose: {
                    type: string;
                    properties: {
                        site_key: {
                            type: string;
                            description: string;
                        };
                        secret: {
                            type: string;
                            description: string;
                        };
                        client_subdomain: {
                            type: string;
                            description: string;
                        };
                        verify_subdomain: {
                            type: string;
                            description: string;
                        };
                        fail_open: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                auth_challenge: {
                    type: string;
                    properties: {
                        fail_open: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                hcaptcha: {
                    type: string;
                    properties: {
                        site_key: {
                            type: string;
                            description: string;
                        };
                        secret: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                friendly_captcha: {
                    type: string;
                    properties: {
                        site_key: {
                            type: string;
                            description: string;
                        };
                        secret: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                recaptcha_enterprise: {
                    type: string;
                    properties: {
                        site_key: {
                            type: string;
                            description: string;
                        };
                        api_key: {
                            type: string;
                            description: string;
                        };
                        project_id: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                recaptcha_v2: {
                    type: string;
                    properties: {
                        site_key: {
                            type: string;
                            description: string;
                        };
                        secret: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                simple_captcha: {
                    type: string;
                };
            };
        };
        suspiciousIpThrottling: {
            type: string;
        };
    };
    additionalProperties: boolean;
};
export type AttackProtection = {
    botDetection?: Asset | null;
    breachedPasswordDetection: Asset;
    bruteForceProtection: Asset;
    captcha?: Asset | null;
    suspiciousIpThrottling: Asset;
};
export default class AttackProtectionHandler extends DefaultAPIHandler {
    existing: AttackProtection | null;
    constructor(config: DefaultAPIHandler);
    objString(item: Asset): string;
    getType(): Promise<Asset>;
    processChanges(assets: Assets): Promise<void>;
}
