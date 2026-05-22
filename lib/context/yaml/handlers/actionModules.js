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
async function parse(context) {
    const { actionModules } = context.assets;
    if (!actionModules)
        return { actionModules: null };
    return {
        actionModules: [
            ...actionModules.map((module) => ({
                ...module,
                code: context.loadFile(module.code || ''),
            })),
        ],
    };
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
function mapModuleCode(basePath, module) {
    const { code } = module;
    if (!code) {
        return '';
    }
    const moduleName = (0, utils_1.sanitize)(module.name);
    const modulesFolder = path_1.default.join(basePath, tools_1.constants.ACTION_MODULES_DIRECTORY, moduleName);
    fs_extra_1.default.ensureDirSync(modulesFolder);
    const codeFile = path_1.default.join(modulesFolder, 'code.js');
    logger_1.default.info(`Writing ${codeFile}`);
    fs_extra_1.default.writeFileSync(codeFile, code);
    return `./${tools_1.constants.ACTION_MODULES_DIRECTORY}/${moduleName}/code.js`;
}
async function dump(context) {
    const { actionModules } = context.assets;
    if (!actionModules || actionModules.length === 0)
        return { actionModules: null };
    const includeIdentifiers = Boolean(context.config.AUTH0_EXPORT_IDENTIFIERS);
    return {
        actionModules: actionModules?.map((module) => ({
            ...(includeIdentifiers && module.id ? { id: module.id } : {}),
            name: module.name,
            code: mapModuleCode(context.basePath, module),
            dependencies: module.dependencies || [],
            secrets: mapSecrets(module.secrets),
            actions_using_module_total: module.actions_using_module_total,
            all_changes_published: module.all_changes_published,
            latest_version_number: module.latest_version_number,
        })),
    };
}
const ActionModulesHandler = {
    parse,
    dump,
};
exports.default = ActionModulesHandler;
