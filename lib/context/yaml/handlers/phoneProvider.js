"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("../../defaults");
async function parse(context) {
    const { phoneProviders } = context.assets;
    if (!phoneProviders)
        return { phoneProviders: null };
    return {
        phoneProviders,
    };
}
async function dump(context) {
    if (!context.assets.phoneProviders)
        return { phoneProviders: null };
    let { phoneProviders } = context.assets;
    phoneProviders = phoneProviders.map((provider) => {
        provider = (0, defaults_1.phoneProviderDefaults)(provider);
        return provider;
    });
    return {
        phoneProviders,
    };
}
const phoneProviderHandler = {
    parse,
    dump,
};
exports.default = phoneProviderHandler;
