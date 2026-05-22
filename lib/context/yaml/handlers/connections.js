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
async function parse(context) {
    const { connections } = context.assets;
    const connectionsFolder = path_1.default.join(context.basePath, tools_1.constants.CONNECTIONS_DIRECTORY);
    if (!connections) {
        return { connections: null };
    }
    return {
        connections: [
            ...connections.map((connection) => {
                if (connection.strategy === 'email') {
                    (0, utils_1.ensureProp)(connection, 'options.email.body');
                    const htmlFileName = path_1.default.join(connectionsFolder, connection.options.email.body);
                    if (!(0, utils_1.isFile)(htmlFileName)) {
                        const missingTemplateErrorMessage = `Passwordless email template purportedly located at ${htmlFileName} does not exist for connection. Ensure the existence of this file to proceed with deployment.`;
                        logger_1.default.error(missingTemplateErrorMessage);
                        throw new Error(missingTemplateErrorMessage);
                    }
                    connection.options.email.body = context.loadFile(htmlFileName);
                }
                return connection;
            }),
        ],
    };
}
async function dump(context) {
    let { connections } = context.assets;
    const { clients } = context.assets;
    if (!connections)
        return { connections: null };
    // Filter excluded connections
    const excludedConnections = (context.assets.exclude && context.assets.exclude.connections) || [];
    if (excludedConnections.length) {
        connections = connections.filter((connection) => !excludedConnections.includes(connection.name));
    }
    return {
        connections: connections.map((connection) => {
            let dumpedConnection = {
                ...connection,
                ...(0, utils_1.getFormattedOptions)(connection, clients),
                ...(connection.enabled_clients && {
                    enabled_clients: (0, utils_1.mapClientID2NameSorted)(connection.enabled_clients, clients || []),
                }),
            };
            // Mask secrets
            dumpedConnection = (0, defaults_1.connectionDefaults)(dumpedConnection);
            if (dumpedConnection.strategy === 'email') {
                (0, utils_1.ensureProp)(connection, 'options.email.body');
                const connectionsFolder = path_1.default.join(context.basePath, tools_1.constants.CONNECTIONS_DIRECTORY);
                const connectionName = (0, utils_1.sanitize)(dumpedConnection.name);
                const html = dumpedConnection.options.email.body;
                const emailConnectionHtml = path_1.default.join(connectionsFolder, `${connectionName}.html`);
                logger_1.default.info(`Writing ${emailConnectionHtml}`);
                fs_extra_1.default.ensureDirSync(connectionsFolder);
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
            return dumpedConnection;
        }),
    };
}
const connectionsHandler = {
    parse,
    dump,
};
exports.default = connectionsHandler;
