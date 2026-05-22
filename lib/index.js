#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = exports.dump = void 0;
// eslint-disable-next-line import/no-extraneous-dependencies
const undici_1 = require("undici");
const args_1 = require("./args");
const logger_1 = __importDefault(require("./logger"));
const tools_1 = __importDefault(require("./tools"));
const import_1 = __importDefault(require("./commands/import"));
const export_1 = __importDefault(require("./commands/export"));
async function run(params) {
    // Run command
    const command = params._[0];
    const proxy = params.proxy_url;
    if (proxy) {
        const MAJOR_NODEJS_VERSION = parseInt(process.version.slice(1).split('.')[0], 10);
        if (MAJOR_NODEJS_VERSION < 10) {
            throw new Error('The --proxy_url option is only supported on Node >= 10');
        }
        process.env.HTTP_PROXY = proxy;
        logger_1.default.debug(`Setting proxy to ${proxy}`);
        // moving from `global-agent` to undici due to update on SDK 4.x.x
        (0, undici_1.setGlobalDispatcher)(new undici_1.ProxyAgent(process.env.HTTP_PROXY));
    }
    logger_1.default.debug(`Start command ${command}`);
    if (['deploy', 'import'].includes(command) && 'input_file' in params) {
        await (0, import_1.default)(params);
    }
    if (['dump', 'export'].includes(command) && 'output_folder' in params) {
        await (0, export_1.default)(params);
    }
    logger_1.default.debug(`Finished command ${command}`);
}
// Only run if from command line
if (require.main === module) {
    // Load cli params
    const params = (0, args_1.getParams)();
    logger_1.default.debug('Starting Auth0 Deploy CLI Tool');
    if (params.debug) {
        logger_1.default.level = 'debug';
        // Set for tools
        process.env.AUTH0_DEBUG = 'true';
        process.env.AUTH0_LOG = 'debug';
    }
    run(params)
        .then(() => process.exit(0))
        .catch((error) => {
        const command = params._[0];
        if (error.type || error.stage) {
            logger_1.default.error(`Problem running command ${command} during stage ${error.stage} when processing type ${error.type}`);
        }
        else {
            logger_1.default.error(`Problem running command ${command}`);
        }
        const msg = error.message || error.toString();
        logger_1.default.error(msg);
        if (process.env.AUTH0_DEBUG === 'true' && error.stack) {
            logger_1.default.debug(error.stack);
        }
        if (typeof msg === 'string' && msg.includes('Payload validation error')) {
            logger_1.default.info('Please refer to the Auth0 Management API docs for expected payloads: https://auth0.com/docs/api/management/v2');
        }
        process.exit(1);
    });
}
// Export commands to be used programmatically
// Explicit type to avoid non-portable type inference
const cliCommands = {
    deploy: import_1.default,
    dump: export_1.default,
    import: import_1.default,
    export: export_1.default,
    tools: tools_1.default,
};
exports.default = cliCommands;
exports.dump = export_1.default;
exports.deploy = import_1.default;
