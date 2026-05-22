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
    const { hooks } = context.assets;
    if (!hooks)
        return { hooks: null };
    return {
        hooks: [
            ...hooks.map((hook) => {
                if (hook.script) {
                    //@ts-ignore TODO: understand why two arguments are passed when context.loadFile only accepts one
                    hook.script = context.loadFile(hook.script, tools_1.constants.HOOKS_DIRECTORY);
                }
                hook.name = hook.name.toLowerCase().replace(/\s/g, '-');
                return { ...hook };
            }),
        ],
    };
}
async function dump(context) {
    let hooks = context.assets.hooks;
    if (!hooks) {
        return { hooks: null };
    }
    // Create hooks folder
    const hooksFolder = path_1.default.join(context.basePath, 'hooks');
    fs_extra_1.default.ensureDirSync(hooksFolder);
    hooks = hooks.map((hook) => {
        // Dump hook code to file
        // For cases when hook does not have `meta['hook-name']`
        hook.name = hook.name || hook.id;
        const codeName = (0, utils_1.sanitize)(`${hook.name}.js`);
        const codeFile = path_1.default.join(hooksFolder, codeName);
        logger_1.default.info(`Writing ${codeFile}`);
        fs_extra_1.default.writeFileSync(codeFile, hook.script);
        return { ...hook, script: `./hooks/${codeName}` };
    });
    return { hooks };
}
const hooksHandler = {
    parse,
    dump,
};
exports.default = hooksHandler;
