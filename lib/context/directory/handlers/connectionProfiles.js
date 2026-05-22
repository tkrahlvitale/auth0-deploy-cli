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
    const connectionProfilesFolder = path_1.default.join(context.filePath, tools_1.constants.CONNECTION_PROFILES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(connectionProfilesFolder))
        return { connectionProfiles: null }; // Skip
    const files = (0, utils_1.getFiles)(connectionProfilesFolder, ['.json']);
    const connectionProfiles = files.map((f) => {
        const profile = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return profile;
    });
    return {
        connectionProfiles,
    };
}
async function dump(context) {
    const { connectionProfiles } = context.assets;
    if (!connectionProfiles)
        return;
    const connectionProfilesFolder = path_1.default.join(context.filePath, tools_1.constants.CONNECTION_PROFILES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(connectionProfilesFolder);
    connectionProfiles.forEach((profile) => {
        const profileFile = path_1.default.join(connectionProfilesFolder, (0, utils_1.sanitize)(`${profile.name}.json`));
        logger_1.default.info(`Writing ${profileFile}`);
        // Remove read-only fields
        if ('id' in profile) {
            delete profile.id;
        }
        (0, utils_1.dumpJSON)(profileFile, profile);
    });
}
const connectionProfilesHandler = {
    parse,
    dump,
};
exports.default = connectionProfilesHandler;
