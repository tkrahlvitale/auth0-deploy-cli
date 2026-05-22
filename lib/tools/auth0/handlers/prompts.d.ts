import { Management } from 'auth0';
import DefaultHandler from './default';
import { Assets, Language } from '../../../types';
declare const promptTypes: readonly ["login", "login-id", "login-password", "login-passwordless", "login-email-verification", "signup", "signup-id", "signup-password", "phone-identifier-enrollment", "phone-identifier-challenge", "email-identifier-challenge", "reset-password", "custom-form", "consent", "customized-consent", "logout", "mfa-push", "mfa-otp", "mfa-voice", "mfa-phone", "mfa-webauthn", "mfa-sms", "mfa-email", "mfa-recovery-code", "mfa", "status", "device-flow", "email-verification", "email-otp-challenge", "organizations", "invitation", "common", "captcha", "passkeys", "brute-force-protection"];
export type PromptTypes = (typeof promptTypes)[number];
declare const screenTypes: readonly ["login", "login-id", "login-password", "login-email-verification", "signup", "signup-id", "signup-password", "reset-password-request", "reset-password-email", "reset-password", "reset-password-success", "reset-password-error", "consent", "status", "mfa-detect-browser-capabilities", "mfa-enroll-result", "mfa-login-options", "mfa-begin-enroll-options", "mfa-otp-enrollment-qr", "mfa-otp-enrollment-code", "mfa-otp-challenge", "mfa-voice-challenge", "mfa-sms-challenge", "mfa-recovery-code-enrollment", "mfa-recovery-code-challenge", "mfa-country-codes", "mfa-sms-enrollment", "mfa-voice-enrollment", "mfa-phone-challenge", "mfa-phone-enrollment", "mfa-webauthn-roaming-enrollment", "mfa-webauthn-platform-enrollment", "mfa-webauthn-platform-challenge", "mfa-webauthn-roaming-challenge", "mfa-webauthn-change-key-nickname", "mfa-webauthn-enrollment-success", "mfa-webauthn-error", "mfa-webauthn-not-available-error", "mfa-sms-list", "mfa-email-challenge", "mfa-email-list", "mfa-push-welcome", "mfa-push-list", "mfa-push-enrollment-qr", "mfa-push-enrollment-code", "mfa-push-success", "mfa-push-challenge-push", "device-code-activation", "device-code-activation-allowed", "device-code-activation-denied", "device-code-confirmation", "email-verification-result", "email-otp-challenge", "redeem-ticket", "organization-selection", "pre-login-organization-picker", "accept-invitation", "login-passwordless-email-code", "login-passwordless-email-link", "login-passwordless-sms-otp", "passkey-enrollment", "passkey-enrollment-local", "brute-force-protection-unblock", "brute-force-protection-unblock-success", "brute-force-protection-unblock-failure"];
export type ScreenTypes = (typeof screenTypes)[number];
declare const customPartialsPromptTypes: string[];
export type CustomPartialsPromptTypes = (typeof customPartialsPromptTypes)[number];
export type CustomPartialsScreenTypes = (typeof customPartialsPromptTypes)[number];
declare const customPartialsInsertionPoints: readonly ["form-content-start", "form-content-end", "form-footer-start", "form-footer-end", "secondary-actions-start", "secondary-actions-end"];
export type CustomPartialsInsertionPoints = (typeof customPartialsInsertionPoints)[number];
export type CustomPromptPartialsScreens = Partial<{
    [screen in CustomPartialsScreenTypes]: Partial<{
        [insertionPoint in CustomPartialsInsertionPoints]: string;
    }>;
}>;
export type CustomPromptPartials = Partial<{
    [prompt in CustomPartialsPromptTypes]: CustomPromptPartialsScreens;
}>;
export interface ScreenConfig {
    name: string;
    template: string;
}
export type CustomPartialsConfig = {
    [prompt in CustomPartialsPromptTypes]: [
        {
            [screen in CustomPartialsScreenTypes]: ScreenConfig[];
        }
    ];
};
export type PromptScreenRenderSettings = {
    name: string;
    body: string;
};
export declare const schema: {
    type: string;
    properties: {
        universal_login_experience: {
            type: string;
            enum: string[];
        };
        webauthn_platform_first_factor: {
            type: string;
        };
        identifier_first: {
            type: string;
        };
        customText: {
            type: string;
            properties: {};
        };
        partials: {
            type: string;
            properties: {};
        };
        screenRenderers: {
            type: string;
            properties: {};
        };
    };
};
export type PromptSettings = {
    universal_login_experience?: 'new' | 'classic';
    webauthn_platform_first_factor?: boolean;
    identifier_first?: boolean;
};
export type PromptsCustomText = {
    [key in PromptTypes]: Partial<{
        [key in ScreenTypes]: {
            [key: string]: string;
        };
    }>;
};
export type AllPromptsByLanguage = Partial<{
    [key in Language]: Partial<PromptsCustomText>;
}>;
export type ScreenRenderer = Management.GetAculResponseContent;
export type Prompts = Partial<PromptSettings & {
    customText: AllPromptsByLanguage;
    partials: CustomPromptPartials;
    screenRenderers?: ScreenRenderer[];
}>;
export default class PromptsHandler extends DefaultHandler {
    existing: Prompts;
    private IsFeatureSupported;
    constructor(options: DefaultHandler);
    objString({ customText, screenRenderers }: Prompts): string;
    getType(): Promise<Prompts | null>;
    getCustomTextSettings(): Promise<AllPromptsByLanguage>;
    /**
     * Error handler wrapper.
     */
    withErrorHandling(callback: any): Promise<any>;
    getCustomPartial({ prompt, }: {
        prompt: Management.PartialGroupsEnum;
    }): Promise<CustomPromptPartials>;
    getCustomPromptsPartials(): Promise<CustomPromptPartials>;
    processChanges(assets: Assets): Promise<void>;
    updateCustomTextSettings(customText: Prompts['customText']): Promise<void>;
    updateCustomPartials({ prompt, body, }: {
        prompt: Management.PartialGroupsEnum;
        body: Management.SetPartialsRequestContent;
    }): Promise<void>;
    updateCustomPromptsPartials(partials: Prompts['partials']): Promise<void>;
    updateScreenRenderer(screenRenderer: ScreenRenderer): Promise<void>;
    updateScreenRenderers(screenRenderers: Prompts['screenRenderers']): Promise<void>;
}
export {};
