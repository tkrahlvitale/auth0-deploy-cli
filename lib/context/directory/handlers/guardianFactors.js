"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../tools/utils");
const utils_2 = require("../../../utils");
function parse(context) {
    const factorsFolder = path_1.default.join(context.filePath, tools_1.constants.GUARDIAN_DIRECTORY, tools_1.constants.GUARDIAN_FACTORS_DIRECTORY);
    if (!(0, utils_2.existsMustBeDir)(factorsFolder))
        return { guardianFactors: null }; // Skip
    const foundFiles = (0, utils_2.getFiles)(factorsFolder, ['.json']);
    let guardianFactors = foundFiles
        .map((f) => (0, utils_2.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 0); // Filter out empty guardianFactors
    guardianFactors = (0, utils_1.sortGuardianFactors)(guardianFactors);
    return {
        guardianFactors,
    };
}
async function dump(context) {
    const { guardianFactors } = context.assets;
    if (!guardianFactors)
        return; // Skip, nothing to dump
    const factorsFolder = path_1.default.join(context.filePath, tools_1.constants.GUARDIAN_DIRECTORY, tools_1.constants.GUARDIAN_FACTORS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(factorsFolder);
    guardianFactors.forEach((factor) => {
        const factorFile = path_1.default.join(factorsFolder, `${factor.name}.json`);
        (0, utils_2.dumpJSON)(factorFile, factor);
    });
}
const guardianFactorsHandler = {
    parse,
    dump,
};
exports.default = guardianFactorsHandler;
