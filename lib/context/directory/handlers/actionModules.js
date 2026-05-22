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
function parse(context) {
    const modulesFolder = path_1.default.join(context.filePath, tools_1.constants.ACTION_MODULES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(modulesFolder))
        return { actionModules: null };
    const files = (0, utils_1.getFiles)(modulesFolder, ['.json']);
    const actionModules = files.map((file) => {
        const module = {
            ...(0, utils_1.loadJSON)(file, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        const moduleFolder = path_1.default.join(tools_1.constants.ACTION_MODULES_DIRECTORY, `${module.name}`);
        if (module.code) {
            // The `module.code` can be a file path. It needs to be loaded.
            // It can be a relative path, so we need to handle both cases.
            const unixPath = module.code.replace(/[\\/]+/g, '/').replace(/^([a-zA-Z]+:|\.\/)/, '');
            if (fs_extra_1.default.existsSync(unixPath)) {
                logger_1.default.warn(`Support for absolute paths and paths outside the config root will be deprecated in a future version to improve the security of the tool. ` +
                    `Please update your configuration to use paths relative to the config directory. ` +
                    `Current absolute path used: ["${module.code}"]`);
                module.code = context.loadFile(unixPath, moduleFolder);
            }
            else {
                module.code = context.loadFile(path_1.default.join(context.filePath, module.code), moduleFolder);
            }
        }
        return module;
    });
    return { actionModules };
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
function mapModuleCode(filePath, module) {
    const { code } = module;
    if (!code) {
        return '';
    }
    const moduleName = (0, utils_1.sanitize)(module.name);
    const moduleFolder = path_1.default.join(filePath, tools_1.constants.ACTION_MODULES_DIRECTORY, `${moduleName}`);
    fs_extra_1.default.ensureDirSync(moduleFolder);
    const codeFile = path_1.default.join(moduleFolder, 'code.js');
    logger_1.default.info(`Writing ${codeFile}`);
    fs_extra_1.default.writeFileSync(codeFile, code);
    return `./${tools_1.constants.ACTION_MODULES_DIRECTORY}/${moduleName}/code.js`;
}
function mapToActionModule(filePath, module, includeIdentifiers) {
    return {
        ...(includeIdentifiers && module.id ? { id: module.id } : {}),
        name: module.name,
        code: mapModuleCode(filePath, module),
        dependencies: module.dependencies,
        secrets: mapSecrets(module.secrets),
        actions_using_module_total: module.actions_using_module_total,
        all_changes_published: module.all_changes_published,
        latest_version_number: module.latest_version_number,
    };
}
async function dump(context) {
    const { actionModules } = context.assets;
    if (!actionModules)
        return;
    // Create action modules folder
    const modulesFolder = path_1.default.join(context.filePath, tools_1.constants.ACTION_MODULES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(modulesFolder);
    const includeIdentifiers = Boolean(context.config.AUTH0_EXPORT_IDENTIFIERS);
    actionModules.forEach((module) => {
        const name = (0, utils_1.sanitize)(module.name);
        const moduleFile = path_1.default.join(modulesFolder, `${name}.json`);
        (0, utils_1.dumpJSON)(moduleFile, mapToActionModule(context.filePath, module, includeIdentifiers));
    });
}
const actionModulesHandler = {
    parse,
    dump,
};
exports.default = actionModulesHandler;
