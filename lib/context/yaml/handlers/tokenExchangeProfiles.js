"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { tokenExchangeProfiles } = context.assets;
    if (!tokenExchangeProfiles)
        return { tokenExchangeProfiles: null };
    return {
        tokenExchangeProfiles,
    };
}
async function dump(context) {
    const { tokenExchangeProfiles } = context.assets;
    if (!tokenExchangeProfiles)
        return { tokenExchangeProfiles: null };
    return {
        tokenExchangeProfiles: tokenExchangeProfiles.map((profile) => {
            // Strip server-generated fields
            const { id, created_at, updated_at, ...cleanProfile } = profile;
            return cleanProfile;
        }),
    };
}
const handler = {
    parse,
    dump,
};
exports.default = handler;
