"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { guardianFactorTemplates } = context.assets;
    if (!guardianFactorTemplates)
        return { guardianFactorTemplates: null };
    return {
        guardianFactorTemplates,
    };
}
const guardianFactorTemplatesHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = guardianFactorTemplatesHandler;
