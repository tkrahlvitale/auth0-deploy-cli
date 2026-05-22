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
    const guardianFolder = path_1.default.join(context.filePath, tools_1.constants.GUARDIAN_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(guardianFolder))
        return { guardianPhoneFactorSelectedProvider: null }; // Skip
    const file = path_1.default.join(guardianFolder, 'phoneFactorSelectedProvider.json');
    if (!(0, utils_1.isFile)(file)) {
        return { guardianPhoneFactorSelectedProvider: null };
    }
    return {
        guardianPhoneFactorSelectedProvider: (0, utils_1.loadJSON)(file, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        }),
    };
}
async function dump(context) {
    const { guardianPhoneFactorSelectedProvider } = context.assets;
    if (!guardianPhoneFactorSelectedProvider)
        return; // Skip, nothing to dump
    const guardianFolder = path_1.default.join(context.filePath, tools_1.constants.GUARDIAN_DIRECTORY);
    fs_extra_1.default.ensureDirSync(guardianFolder);
    const file = path_1.default.join(guardianFolder, 'phoneFactorSelectedProvider.json');
    (0, utils_1.dumpJSON)(file, guardianPhoneFactorSelectedProvider);
}
const guardianFactorSelectedProviderHandler = {
    parse,
    dump,
};
exports.default = guardianFactorSelectedProviderHandler;
