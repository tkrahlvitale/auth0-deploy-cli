"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const logger_1 = __importDefault(require("../../../logger"));
function parse(context) {
    const networkACLsDirectory = path_1.default.join(context.filePath, tools_1.constants.NETWORK_ACLS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(networkACLsDirectory))
        return { networkACLs: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(networkACLsDirectory, ['.json']);
    const networkACLs = foundFiles
        .map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 0); // Filter out empty configs
    return {
        networkACLs,
    };
}
async function dump(context) {
    const { networkACLs } = context.assets;
    if (!networkACLs)
        return; // Skip, nothing to dump
    if (Array.isArray(networkACLs) && networkACLs.length === 0) {
        logger_1.default.info('No network ACLs available, skipping dump');
        return;
    }
    // Create Network ACLs folder
    const networkACLsDirectory = path_1.default.join(context.filePath, tools_1.constants.NETWORK_ACLS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(networkACLsDirectory);
    const removeKeysFromOutput = ['created_at', 'updated_at'];
    networkACLs.forEach((networkACL) => {
        removeKeysFromOutput.forEach((key) => {
            if (key in networkACL) {
                delete networkACL[key];
            }
        });
        const fileName = networkACL.description
            ? `${(0, utils_1.sanitize)(networkACL.description)}-p-${networkACL.priority}`
            : `network-acl-p-${networkACL.priority}`;
        const filePath = path_1.default.join(networkACLsDirectory, `${fileName}.json`);
        (0, utils_1.dumpJSON)(filePath, networkACL);
    });
}
const networkACLsHandler = {
    parse,
    dump,
};
exports.default = networkACLsHandler;
