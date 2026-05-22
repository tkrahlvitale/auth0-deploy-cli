"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { userAttributeProfiles } = context.assets;
    if (!userAttributeProfiles)
        return { userAttributeProfiles: null };
    return {
        userAttributeProfiles,
    };
}
const selfServiceProfileHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = selfServiceProfileHandler;
