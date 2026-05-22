"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { guardianPhoneFactorMessageTypes } = context.assets;
    if (!guardianPhoneFactorMessageTypes)
        return { guardianPhoneFactorMessageTypes: null };
    return {
        guardianPhoneFactorMessageTypes,
    };
}
const guardianPhoneFactorMessageTypesHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = guardianPhoneFactorMessageTypesHandler;
