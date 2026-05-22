"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { guardianPhoneFactorSelectedProvider } = context.assets;
    if (!guardianPhoneFactorSelectedProvider)
        return { guardianPhoneFactorSelectedProvider: null };
    return {
        guardianPhoneFactorSelectedProvider,
    };
}
const guardianPhoneFactorSelectedProviderHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = guardianPhoneFactorSelectedProviderHandler;
