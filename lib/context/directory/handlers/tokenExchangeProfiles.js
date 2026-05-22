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
    const folder = path_1.default.join(context.filePath, tools_1.constants.TOKEN_EXCHANGE_PROFILES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(folder))
        return { tokenExchangeProfiles: null }; // Skip
    const files = (0, utils_1.getFiles)(folder, ['.json']);
    const profiles = files.map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }));
    return {
        tokenExchangeProfiles: profiles,
    };
}
async function dump(context) {
    const { tokenExchangeProfiles } = context.assets;
    if (!tokenExchangeProfiles || !Array.isArray(tokenExchangeProfiles))
        return; // Skip
    const folder = path_1.default.join(context.filePath, tools_1.constants.TOKEN_EXCHANGE_PROFILES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(folder);
    tokenExchangeProfiles.forEach((profile) => {
        const { id, created_at, updated_at, ...profileWithoutMetadata } = profile;
        const fileName = path_1.default.join(folder, (0, utils_1.sanitize)(`${profile.name}.json`));
        logger_1.default.info(`Writing ${fileName}`);
        (0, utils_1.dumpJSON)(fileName, profileWithoutMetadata);
    });
}
const handler = {
    parse,
    dump,
};
exports.default = handler;
