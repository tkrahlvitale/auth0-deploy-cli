"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { customDomains } = context.assets;
    if (!customDomains)
        return { customDomains: null };
    return {
        customDomains,
    };
}
const customDomainsHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = customDomainsHandler;
