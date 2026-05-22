"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exportCMD;
const path_1 = __importDefault(require("path"));
const nconf_1 = __importDefault(require("nconf"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const logger_1 = __importDefault(require("../logger"));
const utils_1 = require("../utils");
const index_1 = require("../context/index");
async function exportCMD(params) {
    const { output_folder: outputFolder, base_path: basePath, config_file: configFile, config: configObj, export_ids: exportIds, export_ordered: exportOrdered, secret: clientSecret, env: shouldInheritEnv = false, experimental_ea: experimentalEA, } = params;
    if (shouldInheritEnv) {
        nconf_1.default.env().use('memory');
    }
    if (configFile) {
        nconf_1.default.file(configFile);
    }
    const overrides = {
        AUTH0_INPUT_FILE: outputFolder,
        AUTH0_BASE_PATH: basePath,
        ...(configObj || {}),
    };
    // Prepare configuration by initializing nconf, then passing that as the provider to the config object
    // Allow passed in secret to override the configured one
    if (clientSecret) {
        overrides.AUTH0_CLIENT_SECRET = clientSecret;
    }
    // Allow passed in export_ids to override the configured one
    if (exportIds) {
        overrides.AUTH0_EXPORT_IDENTIFIERS = exportIds;
    }
    // Allow passed in export_ordered to override the configured one
    if (exportOrdered) {
        overrides.AUTH0_EXPORT_ORDERED = exportOrdered;
    }
    // Overrides AUTH0_INCLUDE_EXPERIMENTAL_EA is experimental_ea passed in command line
    if (experimentalEA) {
        overrides.AUTH0_EXPERIMENTAL_EA = experimentalEA;
        // nconf.overrides() sometimes doesn't work, so we need to set it manually to ensure it's set
        nconf_1.default.set('AUTH0_EXPERIMENTAL_EA', experimentalEA);
    }
    // Check output folder
    if (!(0, utils_1.isDirectory)(outputFolder)) {
        logger_1.default.info(`Creating ${outputFolder}`);
        mkdirp_1.default.sync(outputFolder);
    }
    if (params.format === 'yaml') {
        overrides.AUTH0_INPUT_FILE = path_1.default.join(outputFolder, 'tenant.yaml');
    }
    nconf_1.default.overrides(overrides);
    // Setup context and load
    const context = await (0, index_1.setupContext)(nconf_1.default.get(), 'export');
    await context.dump();
    logger_1.default.info('Export Successful');
}
