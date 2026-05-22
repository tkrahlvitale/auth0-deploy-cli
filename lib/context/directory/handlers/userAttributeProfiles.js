"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
function parse(context) {
    const userAttributeProfilesFolder = path_1.default.join(context.filePath, tools_1.constants.USER_ATTRIBUTE_PROFILES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(userAttributeProfilesFolder))
        return { userAttributeProfiles: null }; // Skip
    const files = (0, utils_1.getFiles)(userAttributeProfilesFolder, ['.json']);
    const userAttributeProfiles = files.map((f) => {
        const uaProfiles = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return uaProfiles;
    });
    return {
        userAttributeProfiles,
    };
}
async function dump(context) {
    const { userAttributeProfiles } = context.assets;
    if (!userAttributeProfiles)
        return;
    const userAttributeProfilesFolder = path_1.default.join(context.filePath, tools_1.constants.USER_ATTRIBUTE_PROFILES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(userAttributeProfilesFolder);
    userAttributeProfiles.forEach((profile) => {
        const profileName = (0, utils_1.sanitize)(profile.name);
        const uapFile = path_1.default.join(userAttributeProfilesFolder, `${profileName}.json`);
        (0, utils_1.dumpJSON)(uapFile, profile);
    });
}
const userAttributeProfilesHandler = {
    parse,
    dump,
};
exports.default = userAttributeProfilesHandler;
