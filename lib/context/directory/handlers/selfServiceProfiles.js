"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
function parse(context) {
    const selfServiceProfilesFolder = path_1.default.join(context.filePath, tools_1.constants.SELF_SERVICE_PROFILE_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(selfServiceProfilesFolder))
        return { selfServiceProfiles: null }; // Skip
    const files = (0, utils_1.getFiles)(selfServiceProfilesFolder, ['.json']);
    const selfServiceProfiles = files.map((f) => {
        const ssProfiles = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return ssProfiles;
    });
    return {
        selfServiceProfiles,
    };
}
async function dump(context) {
    const { selfServiceProfiles, userAttributeProfilesWithId } = context.assets;
    if (!selfServiceProfiles)
        return;
    const selfServiceProfilesFolder = path_1.default.join(context.filePath, tools_1.constants.SELF_SERVICE_PROFILE_DIRECTORY);
    fs_extra_1.default.ensureDirSync(selfServiceProfilesFolder);
    selfServiceProfiles.forEach((profile) => {
        const ssProfileFile = path_1.default.join(selfServiceProfilesFolder, (0, utils_1.sanitize)(`${profile.name}.json`));
        logger_1.default.info(`Writing ${ssProfileFile}`);
        if ('created_at' in profile) {
            delete profile.created_at;
        }
        if ('updated_at' in profile) {
            delete profile.updated_at;
        }
        if (profile.user_attribute_profile_id) {
            const p = userAttributeProfilesWithId?.find((uap) => uap.id === profile.user_attribute_profile_id);
            profile.user_attribute_profile_id = p?.name || profile.user_attribute_profile_id;
            if (profile.user_attributes?.length === 0) {
                delete profile.user_attributes;
            }
        }
        (0, utils_1.dumpJSON)(ssProfileFile, profile);
    });
}
const emailProviderHandler = {
    parse,
    dump,
};
exports.default = emailProviderHandler;
