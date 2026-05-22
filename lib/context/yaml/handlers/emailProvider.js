"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("../../defaults");
async function parse(context) {
    const { emailProvider } = context.assets;
    if (!emailProvider)
        return { emailProvider: null };
    return {
        emailProvider,
    };
}
async function dump(context) {
    if (!context.assets.emailProvider)
        return { emailProvider: null };
    const emailProvider = (() => {
        const { emailProvider } = context.assets;
        const excludedDefaults = context.assets.exclude?.defaults || [];
        if (emailProvider && !excludedDefaults.includes('emailProvider')) {
            // Add placeholder for credentials as they cannot be exported
            return (0, defaults_1.emailProviderDefaults)(emailProvider);
        }
        return emailProvider;
    })();
    return {
        emailProvider,
    };
}
const emailProviderHandler = {
    parse,
    dump,
};
exports.default = emailProviderHandler;
