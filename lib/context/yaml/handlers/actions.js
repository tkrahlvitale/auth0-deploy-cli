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
function parseCode(context, code) {
    if (code) {
        // @ts-ignore TODO: understand why two arguments are passed when context.loadFile only accepts one
        return context.loadFile(code, tools_1.constants.ACTIONS_DIRECTORY);
    }
}
async function parse(context) {
    // Load the script file for each action
    const { actions } = context.assets;
    if (!actions)
        return { actions: null };
    return {
        actions: [
            ...actions.map((action) => ({
                ...action,
                code: parseCode(context, action.code || ''),
            })),
        ],
    };
}
function mapSecrets(secrets) {
    if (typeof secrets === 'string') {
        return secrets; // Enables keyword preservation to operate on action secrets
    }
    if (secrets && secrets.length > 0) {
        return secrets.map((secret) => ({ name: secret.name, value: secret.value }));
    }
    return [];
}
function mapActionCode(basePath, action) {
    const { code } = action;
    if (!code) {
        return '';
    }
    const actionName = (0, utils_1.sanitize)(action.name);
    const actionVersionsFolder = path_1.default.join(basePath, tools_1.constants.ACTIONS_DIRECTORY, actionName);
    fs_extra_1.default.ensureDirSync(actionVersionsFolder);
    const codeFile = path_1.default.join(actionVersionsFolder, 'code.js');
    logger_1.default.info(`Writing ${codeFile}`);
    fs_extra_1.default.writeFileSync(codeFile, code);
    return `./${tools_1.constants.ACTIONS_DIRECTORY}/${actionName}/code.js`;
}
async function dump(context) {
    const { actions } = context.assets;
    if (!actions)
        return { actions: null };
    // Marketplace actions are not currently supported for management (See ESD-23225)
    const filteredActions = actions.filter((action) => {
        if ((0, actions_1.isMarketplaceAction)(action)) {
            logger_1.default.warn(`Skipping export of marketplace action "${action.name}". Management of marketplace actions are not currently supported.`);
            return false;
        }
        return true;
    });
    const includeIdentifiers = Boolean(context.config.AUTH0_EXPORT_IDENTIFIERS);
    return {
        actions: filteredActions.map((action) => ({
            ...(includeIdentifiers && action.id ? { id: action.id } : {}),
            name: action.name,
            deployed: !!action.deployed || !!action.all_changes_deployed,
            // @ts-ignore because Action resource needs to be typed more accurately
            code: mapActionCode(context.basePath, action),
            runtime: action.runtime,
            dependencies: action.dependencies || [],
            status: action.status,
            secrets: mapSecrets(action.secrets),
            supported_triggers: action.supported_triggers,
            modules: action.modules?.map((module) => ({
                module_name: module.module_name,
                module_version_number: module.module_version_number,
            })),
        })),
    };
}
const ActionsHandler = {
    parse,
    dump,
};
exports.default = ActionsHandler;
