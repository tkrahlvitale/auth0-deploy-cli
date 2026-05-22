"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
function parse(context) {
    const rulesFolder = path_1.default.join(context.filePath, tools_1.constants.RULES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(rulesFolder))
        return { rules: null }; // Skip
    const files = (0, utils_1.getFiles)(rulesFolder, ['.json']);
    const rules = files.map((f) => {
        const rule = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        if (rule.script) {
            rule.script = context.loadFile(rule.script, tools_1.constants.RULES_DIRECTORY);
        }
        return rule;
    });
    return {
        rules,
    };
}
async function dump(context) {
    let { rules } = context.assets;
    if (!rules)
        return; // Skip, nothing to dump
    // Filter excluded rules
    const excludedRules = (context.assets.exclude && context.assets.exclude.rules) || [];
    if (excludedRules.length) {
        rules = rules.filter((rule) => !excludedRules.includes(rule.name));
    }
    // Create Rules folder
    const rulesFolder = path_1.default.join(context.filePath, tools_1.constants.RULES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(rulesFolder);
    rules.forEach((rule) => {
        // Dump script to file
        const name = (0, utils_1.sanitize)(rule.name);
        const ruleJS = path_1.default.join(rulesFolder, `${name}.js`);
        logger_1.default.info(`Writing ${ruleJS}`);
        fs_extra_1.default.writeFileSync(ruleJS, rule.script);
        // Dump template metadata
        const ruleFile = path_1.default.join(rulesFolder, `${name}.json`);
        (0, utils_1.dumpJSON)(ruleFile, { ...rule, script: `./${name}.js` });
    });
}
const rulesHandler = {
    parse,
    dump,
};
exports.default = rulesHandler;
