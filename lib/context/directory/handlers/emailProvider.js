"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const defaults_1 = require("../../defaults");
function parse(context) {
    const emailsFolder = path_1.default.join(context.filePath, tools_1.constants.EMAIL_TEMPLATES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(emailsFolder))
        return { emailProvider: null }; // Skip
    const providerFile = path_1.default.join(emailsFolder, 'provider.json');
    if ((0, utils_1.isFile)(providerFile)) {
        return {
            emailProvider: (0, utils_1.loadJSON)(providerFile, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
    }
    return { emailProvider: null };
}
async function dump(context) {
    if (!context.assets.emailProvider)
        return; // Skip, nothing to dump
    let emailProvider = (() => {
        const excludedDefaults = context.assets.exclude?.defaults || [];
        if (!excludedDefaults.includes('emailProvider')) {
            // Add placeholder for credentials as they cannot be exported
            return (0, defaults_1.emailProviderDefaults)(context.assets.emailProvider);
        }
        return context.assets.emailProvider;
    })();
    // Apply EXCLUDED_PROPS after emailProviderDefaults to remove any re-added fields
    const excludedFields = context.config.EXCLUDED_PROPS?.emailProvider || [];
    if (excludedFields.length > 0) {
        emailProvider = { ...emailProvider };
        excludedFields.forEach((field) => {
            dot_prop_1.default.delete(emailProvider, field);
        });
    }
    const emailsFolder = path_1.default.join(context.filePath, tools_1.constants.EMAIL_TEMPLATES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(emailsFolder);
    const emailProviderFile = path_1.default.join(emailsFolder, 'provider.json');
    (0, utils_1.dumpJSON)(emailProviderFile, emailProvider);
}
const emailProviderHandler = {
    parse,
    dump,
};
exports.default = emailProviderHandler;
