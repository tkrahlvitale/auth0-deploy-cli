"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { connectionProfiles } = context.assets;
    if (!connectionProfiles)
        return { connectionProfiles: null };
    return {
        connectionProfiles,
    };
}
async function dump(context) {
    let { connectionProfiles } = context.assets;
    if (!connectionProfiles)
        return { connectionProfiles: null };
    connectionProfiles = connectionProfiles.map((profile) => {
        // Remove read-only fields
        if ('id' in profile) {
            delete profile.id;
        }
        return profile;
    });
    return {
        connectionProfiles,
    };
}
const connectionProfilesHandler = {
    parse,
    dump,
};
exports.default = connectionProfilesHandler;
