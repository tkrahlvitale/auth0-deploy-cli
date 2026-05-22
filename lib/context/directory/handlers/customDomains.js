"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const getCustomDomainsDirectory = (filePath) => path_1.default.join(filePath, tools_1.constants.CUSTOM_DOMAINS_DIRECTORY);
const getCustomDomainsFile = (filePath) => path_1.default.join(getCustomDomainsDirectory(filePath), 'custom-domains.json');
function parse(context) {
    const customDomainsDirectory = getCustomDomainsDirectory(context.filePath);
    if (!(0, utils_1.existsMustBeDir)(customDomainsDirectory))
        return { customDomains: null }; // Skip
    const customDomainsFile = getCustomDomainsFile(context.filePath);
    return {
        customDomains: (0, utils_1.loadJSON)(customDomainsFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        }),
    };
}
async function dump(context) {
    const { customDomains } = context.assets;
    if (!customDomains)
        return; // Skip, nothing to dump
    // Create Rules folder
    const customDomainsDirectory = getCustomDomainsDirectory(context.filePath);
    fs_extra_1.default.ensureDirSync(customDomainsDirectory);
    const customDomainsFile = getCustomDomainsFile(context.filePath);
    (0, utils_1.dumpJSON)(customDomainsFile, customDomains);
}
const customDomainsHandler = {
    parse,
    dump,
};
exports.default = customDomainsHandler;
