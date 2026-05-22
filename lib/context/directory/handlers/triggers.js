"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
function parse(context) {
    const triggersFolder = path_1.default.join(context.filePath, tools_1.constants.TRIGGERS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(triggersFolder))
        return { triggers: null }; // Skip
    const files = (0, utils_1.getFiles)(triggersFolder, ['.json']);
    const triggers = {
        ...(0, utils_1.loadJSON)(files[0], {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        }),
    };
    return { triggers };
}
async function dump(context) {
    const { triggers } = context.assets;
    if (!triggers)
        return;
    // Create triggers folder
    const triggersFolder = path_1.default.join(context.filePath, tools_1.constants.TRIGGERS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(triggersFolder);
    const triggerFile = path_1.default.join(triggersFolder, 'triggers.json');
    (0, utils_1.dumpJSON)(triggerFile, triggers);
}
const triggersHandler = {
    parse,
    dump,
};
exports.default = triggersHandler;
