"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../logger"));
async function dump(context) {
    const { flowVaultConnections } = context.assets;
    if (!flowVaultConnections)
        return { flowVaultConnections: null };
    // Check if there is any duplicate form name
    const vaultConnectionsNames = new Set();
    const duplicateVaultConnectionsNames = new Set();
    flowVaultConnections.forEach((form) => {
        if (vaultConnectionsNames.has(form.name)) {
            duplicateVaultConnectionsNames.add(form.name);
        }
        else {
            vaultConnectionsNames.add(form.name);
        }
    });
    if (duplicateVaultConnectionsNames.size > 0) {
        const duplicatesArray = Array.from(duplicateVaultConnectionsNames).join(', ');
        logger_1.default.error(`Duplicate flow vault connections names found: [${duplicatesArray}] , make sure to rename them to avoid conflicts`);
        throw new Error(`Duplicate flow vault connections names found: ${duplicatesArray}`);
    }
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
    return {
        flowVaultConnections,
    };
}
async function parse(context) {
    const { flowVaultConnections } = context.assets;
    if (!flowVaultConnections)
        return { flowVaultConnections: null };
    return {
        flowVaultConnections,
    };
}
const pagesHandler = {
    parse,
    dump,
};
exports.default = pagesHandler;
