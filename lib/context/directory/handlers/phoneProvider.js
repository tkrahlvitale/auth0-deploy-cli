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
    const phoneProvidersFolder = path_1.default.join(context.filePath, tools_1.constants.PHONE_PROVIDER_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(phoneProvidersFolder))
        return { phoneProviders: null }; // Skip
    const providerFile = path_1.default.join(phoneProvidersFolder, 'provider.json');
    if ((0, utils_1.isFile)(providerFile)) {
        return {
            phoneProviders: (0, utils_1.loadJSON)(providerFile, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
    }
    return { phoneProviders: null };
}
async function dump(context) {
    let { phoneProviders } = context.assets;
    if (!phoneProviders) {
        return;
    } // Skip, nothing to dump
    const phoneProvidersFolder = path_1.default.join(context.filePath, tools_1.constants.PHONE_PROVIDER_DIRECTORY);
    fs_extra_1.default.ensureDirSync(phoneProvidersFolder);
    const phoneProviderFile = path_1.default.join(phoneProvidersFolder, 'provider.json');
    phoneProviders = phoneProviders.map((provider) => {
        provider = (0, defaults_1.phoneProviderDefaults)(provider);
        return provider;
    });
    (0, utils_1.dumpJSON)(phoneProviderFile, phoneProviders);
}
const phoneProvidersHandler = {
    parse,
    dump,
};
exports.default = phoneProvidersHandler;
