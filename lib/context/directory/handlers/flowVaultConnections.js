"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = require("lodash");
const tools_1 = require("../../../tools");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
function parse(context) {
    const flowVaultsFolder = path_1.default.join(context.filePath, tools_1.constants.FLOWS_VAULT_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(flowVaultsFolder))
        return { flowVaultConnections: null }; // Skip
    const files = (0, utils_1.getFiles)(flowVaultsFolder, ['.json']);
    const flowVaultConnections = files.map((f) => {
        const connection = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return connection;
    });
    return {
        flowVaultConnections,
    };
}
async function dump(context) {
    const { flowVaultConnections } = context.assets;
    if (!flowVaultConnections || (0, lodash_1.isEmpty)(flowVaultConnections))
        return; // Skip, nothing to dump
    // Check if there is any duplicate form name
    const vaultConnectionsNamesSet = new Set();
    const duplicateVaultConnectionsNames = new Set();
    flowVaultConnections.forEach((form) => {
        if (vaultConnectionsNamesSet.has(form.name)) {
            duplicateVaultConnectionsNames.add(form.name);
        }
        else {
            vaultConnectionsNamesSet.add(form.name);
        }
    });
    if (duplicateVaultConnectionsNames.size > 0) {
        const duplicatesArray = Array.from(duplicateVaultConnectionsNames);
        logger_1.default.error(`Duplicate flow vault connections names found: [${duplicatesArray}] , make sure to rename them to avoid conflicts`);
        throw new Error(`Duplicate flow vault connections names found: ${duplicatesArray}`);
    }
    const flowVaultsFolder = path_1.default.join(context.filePath, tools_1.constants.FLOWS_VAULT_DIRECTORY);
    fs_extra_1.default.ensureDirSync(flowVaultsFolder);
    const removeKeysFromOutput = ['id', 'created_at', 'updated_at', 'refreshed_at', 'fingerprint'];
    flowVaultConnections.forEach((connection) => {
        removeKeysFromOutput.forEach((key) => {
            if (key in connection) {
                delete connection[key];
            }
        });
    });
    // eslint-disable-next-line no-console
    console.warn('WARNING! Flow vault connections `setup` key does not support keyword preservation, `export` or `dump` commmand will not preserve `setup` key in local configuration file.');
    flowVaultConnections.forEach((connection) => {
        const connectionFile = path_1.default.join(flowVaultsFolder, (0, utils_1.sanitize)(`${connection.name}.json`));
        logger_1.default.info(`Writing ${connectionFile}`);
        (0, utils_1.dumpJSON)(connectionFile, connection);
    });
}
const flowVaultsHandler = {
    parse,
    dump,
};
exports.default = flowVaultsHandler;
