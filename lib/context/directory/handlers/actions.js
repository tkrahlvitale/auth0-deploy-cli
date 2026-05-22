"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable consistent-return */
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const logger_1 = __importDefault(require("../../../logger"));
const actions_1 = require("../../../tools/auth0/handlers/actions");
function parse(context) {
    const actionsFolder = path_1.default.join(context.filePath, tools_1.constants.ACTIONS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(actionsFolder))
        return { actions: null }; // Skip
    const files = (0, utils_1.getFiles)(actionsFolder, ['.json']);
    const actions = files.map((file) => {
        const action = {
            ...(0, utils_1.loadJSON)(file, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        const actionFolder = path_1.default.join(tools_1.constants.ACTIONS_DIRECTORY, `${action.name}`);
        if (action.code) {
            // Convert `action.code` path to Unix-style path by replacing backslashes and multiple slashes with a single forward slash, and remove leading drive letters or './'.
            const unixPath = action.code.replace(/[\\/]+/g, '/').replace(/^([a-zA-Z]+:|\.\/)/, '');
            if (fs_extra_1.default.existsSync(unixPath)) {
                // If the Unix-style path exists, load the file from that path
                logger_1.default.warn(`Support for absolute paths and paths outside the config root will be deprecated in a future version to improve the security of the tool. ` +
                    `Please update your configuration to use paths relative to the config directory. ` +
                    `Current absolute path used: ["${action.code}"]`);
                action.code = context.loadFile(unixPath, actionFolder);
            }
            else {
                // Otherwise, load the file from the context's file path
                action.code = context.loadFile(path_1.default.join(context.filePath, action.code), actionFolder);
            }
        }
        return action;
    });
    return { actions };
}
function mapSecrets(secrets) {
    if (typeof secrets === 'string') {
        return secrets;
    }
    if (secrets && secrets.length > 0) {
        return secrets.map((secret) => ({ name: secret.name, value: secret.value }));
    }
    return [];
}
function mapActionCode(filePath, action) {
    const { code } = action;
    if (!code) {
        return '';
    }
    const actionName = (0, utils_1.sanitize)(action.name);
    const actionFolder = path_1.default.join(filePath, tools_1.constants.ACTIONS_DIRECTORY, `${actionName}`);
    fs_extra_1.default.ensureDirSync(actionFolder);
    const codeFile = path_1.default.join(actionFolder, 'code.js');
    logger_1.default.info(`Writing ${codeFile}`);
    fs_extra_1.default.writeFileSync(codeFile, code);
    return `./${tools_1.constants.ACTIONS_DIRECTORY}/${actionName}/code.js`;
}
function mapToAction(filePath, action, includeIdentifiers) {
    return {
        ...(includeIdentifiers && action.id ? { id: action.id } : {}),
        name: action.name,
        code: mapActionCode(filePath, action),
        runtime: action.runtime,
        status: action.status,
        dependencies: action.dependencies,
        secrets: mapSecrets(action.secrets),
        supported_triggers: action.supported_triggers,
        deployed: action.deployed || action.all_changes_deployed,
        installed_integration_id: action.installed_integration_id,
        modules: action.modules?.map((module) => ({
            module_name: module.module_name,
            module_version_number: module.module_version_number,
        })),
    };
}
async function dump(context) {
    const { actions } = context.assets;
    if (!actions)
        return;
    // Marketplace actions are not currently supported for management (See ESD-23225)
    const filteredActions = actions.filter((action) => {
        if ((0, actions_1.isMarketplaceAction)(action)) {
            logger_1.default.warn(`Skipping export of marketplace action "${action.name}". Management of marketplace actions are not currently supported.`);
            return false;
        }
        return true;
    });
    // Create Actions folder
    const actionsFolder = path_1.default.join(context.filePath, tools_1.constants.ACTIONS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(actionsFolder);
    const includeIdentifiers = Boolean(context.config.AUTH0_EXPORT_IDENTIFIERS);
    filteredActions.forEach((action) => {
        // Dump template metadata
        const name = (0, utils_1.sanitize)(action.name);
        const actionFile = path_1.default.join(actionsFolder, `${name}.json`);
        (0, utils_1.dumpJSON)(actionFile, mapToAction(context.filePath, action, includeIdentifiers));
    });
}
const actionsHandler = {
    parse,
    dump,
};
exports.default = actionsHandler;
