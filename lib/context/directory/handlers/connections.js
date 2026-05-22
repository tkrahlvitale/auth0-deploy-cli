"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
const defaults_1 = require("../../defaults");
function parse(context) {
    const connectionDirectory = context.config.AUTH0_CONNECTIONS_DIRECTORY || tools_1.constants.CONNECTIONS_DIRECTORY;
    const connectionsFolder = path_1.default.join(context.filePath, connectionDirectory);
    if (!(0, utils_1.existsMustBeDir)(connectionsFolder))
        return { connections: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(connectionsFolder, ['.json']);
    const connections = foundFiles
        .map((f) => {
        const connection = (0, utils_1.loadJSON)(f, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        if (connection.strategy === 'email') {
            (0, utils_1.ensureProp)(connection, 'options.email.body');
            const htmlFileName = path_1.default.join(connectionsFolder, connection.options.email.body);
            if (!(0, utils_1.isFile)(htmlFileName)) {
                throw new Error(`Passwordless email template purportedly located at ${htmlFileName} does not exist for connection. Ensure the existence of this file to proceed with deployment.`);
            }
            connection.options.email.body = (0, tools_1.loadFileAndReplaceKeywords)(htmlFileName, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            });
        }
        return connection;
    })
        .filter((p) => Object.keys(p).length > 0); // Filter out empty connections
    return {
        connections,
    };
}
async function dump(context) {
    let { connections } = context.assets;
    const { clientsOrig } = context.assets;
    if (!connections)
        return; // Skip, nothing to dump
    // Filter excluded connections
    const excludedConnections = (context.assets.exclude && context.assets.exclude.connections) || [];
    if (excludedConnections.length) {
        connections = connections.filter((connection) => !excludedConnections.includes(connection.name));
    }
    const connectionsFolder = path_1.default.join(context.filePath, tools_1.constants.CONNECTIONS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(connectionsFolder);
    // Convert enabled_clients from id to name
    connections.forEach((connection) => {
        let dumpedConnection = {
            ...connection,
            ...(0, utils_1.getFormattedOptions)(connection, clientsOrig),
            ...(connection.enabled_clients && {
                enabled_clients: (0, utils_1.mapClientID2NameSorted)(connection.enabled_clients, clientsOrig || []),
            }),
        };
        const connectionName = (0, utils_1.sanitize)(dumpedConnection.name);
        // Mask secrets
        dumpedConnection = (0, defaults_1.connectionDefaults)(dumpedConnection);
        if (dumpedConnection.strategy === 'email') {
            (0, utils_1.ensureProp)(dumpedConnection, 'options.email.body');
            const html = dumpedConnection.options.email.body;
            const emailConnectionHtml = path_1.default.join(connectionsFolder, `${connectionName}.html`);
            logger_1.default.info(`Writing ${emailConnectionHtml}`);
            fs_extra_1.default.writeFileSync(emailConnectionHtml, html);
            dumpedConnection.options.email.body = `./${connectionName}.html`;
        }
        if (dumpedConnection.strategy === 'samlp' && dumpedConnection.options) {
            if ('cert' in dumpedConnection.options) {
                dumpedConnection.options.cert = (0, utils_1.encodeCertStringToBase64)(dumpedConnection.options.cert);
            }
            if ('signingCert' in dumpedConnection.options) {
                dumpedConnection.options.signingCert = (0, utils_1.encodeCertStringToBase64)(dumpedConnection.options.signingCert);
            }
        }
        const connectionFile = path_1.default.join(connectionsFolder, `${connectionName}.json`);
        (0, utils_1.dumpJSON)(connectionFile, dumpedConnection);
    });
}
const connectionsHandler = {
    parse,
    dump,
};
exports.default = connectionsHandler;
