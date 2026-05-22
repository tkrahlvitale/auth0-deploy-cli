"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = importCMD;
const nconf_1 = __importDefault(require("nconf"));
const configFactory_1 = require("../configFactory");
const tools_1 = require("../tools");
const logger_1 = __importDefault(require("../logger"));
const context_1 = require("../context");
const utils_1 = require("../utils");
async function importCMD(params) {
    const { input_file: inputFile, base_path: basePath, config_file: configFile, config: configObj, env: shouldInheritEnv = false, secret: clientSecret, experimental_ea: experimentalEA, dry_run: dryRun, interactive = false, apply = false, } = params;
    const normalizedDryRun = dryRun === true || dryRun === '' ? 'preview' : dryRun;
    let effectiveDryRun;
    if (!normalizedDryRun) {
        effectiveDryRun = undefined;
    }
    else if (normalizedDryRun !== 'preview') {
        throw new Error(`Invalid value for --dry-run: ${normalizedDryRun}. Use --dry-run or --dry-run=preview.`);
    }
    else {
        effectiveDryRun = normalizedDryRun;
    }
    if (apply && !effectiveDryRun) {
        throw new Error('--apply must be used with --dry-run.');
    }
    if (interactive && !effectiveDryRun) {
        throw new Error('--interactive must be used with --dry-run.');
    }
    if (interactive && apply) {
        throw new Error('--interactive and --apply cannot be used together.');
    }
    if (shouldInheritEnv) {
        nconf_1.default.env().use('memory');
        const mappings = nconf_1.default.get('AUTH0_KEYWORD_REPLACE_MAPPINGS') || {};
        nconf_1.default.set('AUTH0_KEYWORD_REPLACE_MAPPINGS', Object.assign(mappings, process.env));
    }
    if (configFile) {
        nconf_1.default.file(configFile);
    }
    const overrides = {
        AUTH0_INPUT_FILE: inputFile,
        AUTH0_BASE_PATH: basePath,
        AUTH0_KEYWORD_REPLACE_MAPPINGS: {},
        ...(configObj || {}),
    };
    // Prepare configuration by initializing nconf, then passing that as the provider to the config object
    // Allow passed in secret to override the configured one
    if (clientSecret) {
        overrides.AUTH0_CLIENT_SECRET = clientSecret;
    }
    // Overrides AUTH0_INCLUDE_EXPERIMENTAL_EA is experimental_ea passed in command line
    if (experimentalEA) {
        overrides.AUTH0_EXPERIMENTAL_EA = experimentalEA;
        // nconf.overrides() sometimes doesn't work, so we need to set it manually to ensure it's set
        nconf_1.default.set('AUTH0_EXPERIMENTAL_EA', experimentalEA);
    }
    // Override AUTH0_DRY_RUN if dry_run passed in command line
    if (effectiveDryRun) {
        overrides.AUTH0_DRY_RUN = effectiveDryRun;
        nconf_1.default.set('AUTH0_DRY_RUN', effectiveDryRun);
    }
    if (interactive) {
        overrides.AUTH0_DRY_RUN_INTERACTIVE = interactive;
        nconf_1.default.set('AUTH0_DRY_RUN_INTERACTIVE', interactive);
    }
    const existingDryRunApply = nconf_1.default.get('AUTH0_DRY_RUN_APPLY');
    if (apply || (0, utils_1.isTruthy)(existingDryRunApply)) {
        overrides.AUTH0_DRY_RUN_APPLY = true;
        nconf_1.default.set('AUTH0_DRY_RUN_APPLY', true);
    }
    nconf_1.default.overrides(overrides);
    // Setup context and load
    const context = await (0, context_1.setupContext)(nconf_1.default.get(), 'import');
    await context.loadAssetsFromLocal();
    const config = (0, configFactory_1.configFactory)();
    config.setProvider((key) => nconf_1.default.get(key));
    // @ts-ignore because context and assets still need to be typed TODO: type assets and type context
    await (0, tools_1.deploy)(context.assets, context.mgmtClient, config);
    if (!effectiveDryRun) {
        logger_1.default.info('Import Successful');
    }
}
