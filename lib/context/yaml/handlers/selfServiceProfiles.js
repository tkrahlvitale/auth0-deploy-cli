"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { selfServiceProfiles } = context.assets;
    if (!selfServiceProfiles)
        return { selfServiceProfiles: null };
    return {
        selfServiceProfiles,
    };
}
async function dump(context) {
    const { userAttributeProfiles } = context.assets;
    let { selfServiceProfiles } = context.assets;
    if (!selfServiceProfiles)
        return { selfServiceProfiles: null };
    selfServiceProfiles = selfServiceProfiles.map((profile) => {
        if ('created_at' in profile) {
            delete profile.created_at;
        }
        if ('updated_at' in profile) {
            delete profile.updated_at;
        }
        if (profile.user_attribute_profile_id) {
            const p = userAttributeProfiles?.find((uap) => uap.id === profile.user_attribute_profile_id);
            profile.user_attribute_profile_id = p?.name || profile.user_attribute_profile_id;
            if (profile.user_attributes?.length === 0) {
                delete profile.user_attributes;
            }
        }
        return {
            ...profile,
        };
    });
    return {
        selfServiceProfiles,
    };
}
const selfServiceProfileHandler = {
    parse,
    dump,
};
exports.default = selfServiceProfileHandler;
