"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { guardianPolicies } = context.assets;
    if (!guardianPolicies)
        return { guardianPolicies: null };
    return {
        guardianPolicies,
    };
}
const guardianPoliciesHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = guardianPoliciesHandler;
