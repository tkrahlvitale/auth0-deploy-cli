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
    const factorTemplatesFolder = path_1.default.join(context.filePath, tools_1.constants.GUARDIAN_DIRECTORY, tools_1.constants.GUARDIAN_TEMPLATES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(factorTemplatesFolder))
        return { guardianFactorTemplates: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(factorTemplatesFolder, ['.json']);
    const guardianFactorTemplates = foundFiles
        .map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 0); // Filter out empty guardianFactorTemplates
    return {
        guardianFactorTemplates,
    };
}
async function dump(context) {
    const { guardianFactorTemplates } = context.assets;
    if (!guardianFactorTemplates)
        return; // Skip, nothing to dump
    const factorTemplatesFolder = path_1.default.join(context.filePath, tools_1.constants.GUARDIAN_DIRECTORY, tools_1.constants.GUARDIAN_TEMPLATES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(factorTemplatesFolder);
    guardianFactorTemplates.forEach((factorTemplates) => {
        const factorTemplatesFile = path_1.default.join(factorTemplatesFolder, `${factorTemplates.name}.json`);
        (0, utils_1.dumpJSON)(factorTemplatesFile, factorTemplates);
    });
}
const guardianFactorTemplatesHandler = {
    parse,
    dump,
};
exports.default = guardianFactorTemplatesHandler;
