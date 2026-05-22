"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../../../utils");
const logger_1 = __importDefault(require("../../../logger"));
async function parse(context) {
    const { rules } = context.assets;
    if (!rules)
        return { rules: null };
    return {
        rules: [
            ...rules.map((rule) => ({
                ...rule,
                script: context.loadFile(rule.script),
            })),
        ],
    };
}
async function dump(context) {
    let { rules } = context.assets;
    if (!rules) {
        return { rules: null };
    }
    // Filter excluded rules
    const excludedRules = (context.assets.exclude && context.assets.exclude.rules) || [];
    if (excludedRules.length) {
        rules = rules.filter((rule) => !excludedRules.includes(rule.name));
    }
    // Create Rules folder
    const rulesFolder = path_1.default.join(context.basePath, 'rules');
    fs_extra_1.default.ensureDirSync(rulesFolder);
    rules = rules.map((rule) => {
        // Dump rule to file
        const scriptName = (0, utils_1.sanitize)(`${rule.name}.js`);
        const scriptFile = path_1.default.join(rulesFolder, scriptName);
        logger_1.default.info(`Writing ${scriptFile}`);
        fs_extra_1.default.writeFileSync(scriptFile, rule.script);
        return { ...rule, script: `./rules/${scriptName}` };
    });
    return { rules };
}
const rulesHandler = {
    parse,
    dump,
};
exports.default = rulesHandler;
