"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { guardianFactorProviders } = context.assets;
    if (!guardianFactorProviders)
        return { guardianFactorProviders: null };
    return {
        guardianFactorProviders,
    };
}
const guardianFactorProvidersHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = guardianFactorProvidersHandler;
