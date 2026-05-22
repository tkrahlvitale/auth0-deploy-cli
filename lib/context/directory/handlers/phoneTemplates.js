"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const defaults_1 = require("../../defaults");
function parse(context) {
    const phoneTemplatesFolder = path_1.default.join(context.filePath, tools_1.constants.PHONE_TEMPLATES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(phoneTemplatesFolder))
        return { phoneTemplates: null }; // Skip
    const files = (0, utils_1.getFiles)(phoneTemplatesFolder, ['.json']);
    const phoneTemplates = files.map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }));
    return { phoneTemplates };
}
async function dump(context) {
    const { phoneTemplates } = context.assets;
    if (!phoneTemplates) {
        return;
    } // Skip, nothing to dump
    const phoneTemplatesFolder = path_1.default.join(context.filePath, tools_1.constants.PHONE_TEMPLATES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(phoneTemplatesFolder);
    phoneTemplates.forEach((template) => {
        const templateWithDefaults = (0, defaults_1.phoneTemplatesDefaults)(template);
        const templateFile = path_1.default.join(phoneTemplatesFolder, `${template.type}.json`);
        (0, utils_1.dumpJSON)(templateFile, templateWithDefaults);
    });
}
const phoneTemplatesHandler = {
    parse,
    dump,
};
exports.default = phoneTemplatesHandler;
