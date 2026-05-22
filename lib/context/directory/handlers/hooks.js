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
    const hooksFolder = path_1.default.join(context.filePath, tools_1.constants.HOOKS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(hooksFolder))
        return { hooks: null }; // Skip
    const files = (0, utils_1.getFiles)(hooksFolder, ['.json']);
    const hooks = files.map((f) => {
        const hook = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        if (hook.script) {
            hook.script = context.loadFile(hook.script, tools_1.constants.HOOKS_DIRECTORY);
        }
        hook.name = hook.name.toLowerCase().replace(/\s/g, '-');
        return hook;
    });
    return {
        hooks,
    };
}
async function dump(context) {
    const hooks = context.assets.hooks;
    if (!hooks)
        return;
    // Create Hooks folder
    const hooksFolder = path_1.default.join(context.filePath, tools_1.constants.HOOKS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(hooksFolder);
    hooks.forEach((hook) => {
        // Dump script to file
        // For cases when hook does not have `meta['hook-name']`
        hook.name = hook.name || hook.id;
        const name = (0, utils_1.sanitize)(hook.name);
        const hookCode = path_1.default.join(hooksFolder, `${name}.js`);
        logger_1.default.info(`Writing ${hookCode}`);
        fs_extra_1.default.writeFileSync(hookCode, hook.script);
        // Dump template metadata
        const hookFile = path_1.default.join(hooksFolder, `${name}.json`);
        (0, utils_1.dumpJSON)(hookFile, { ...hook, script: `./${name}.js` });
    });
}
const hooksHandler = {
    parse,
    dump,
};
exports.default = hooksHandler;
