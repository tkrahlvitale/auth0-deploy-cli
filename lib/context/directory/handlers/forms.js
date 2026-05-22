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
    const formsFolder = path_1.default.join(context.filePath, tools_1.constants.FORMS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(formsFolder))
        return { forms: null }; // Skip
    const files = (0, utils_1.getFiles)(formsFolder, ['.json']);
    const forms = files.map((f) => {
        const form = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return form;
    });
    return {
        forms,
    };
}
async function dump(context) {
    const { forms } = context.assets;
    if (!forms)
        return; // Skip, nothing to dump
    const formsFolder = path_1.default.join(context.filePath, tools_1.constants.FORMS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(formsFolder);
    // Check if there is any duplicate form name
    const formNameSet = new Set();
    const duplicateFormNames = new Set();
    forms.forEach((form) => {
        if (formNameSet.has(form.name)) {
            duplicateFormNames.add(form.name);
        }
        else {
            formNameSet.add(form.name);
        }
    });
    if (duplicateFormNames.size > 0) {
        const duplicateNamesArray = Array.from(duplicateFormNames).join(', ');
        logger_1.default.error(`Duplicate form names found: [${duplicateNamesArray}] , make sure to rename them to avoid conflicts`);
        throw new Error(`Duplicate form names found: ${duplicateNamesArray}`);
    }
    forms.forEach((form) => {
        if (form.name === undefined) {
            return;
        }
        const formFile = path_1.default.join(formsFolder, (0, utils_1.sanitize)(`${form.name}.json`));
        logger_1.default.info(`Writing ${formFile}`);
        const removeKeysFromOutput = ['id', 'created_at', 'updated_at'];
        removeKeysFromOutput.forEach((key) => {
            if (key in form) {
                delete form[key];
            }
        });
        (0, utils_1.dumpJSON)(formFile, form);
    });
}
const formsHandler = {
    parse,
    dump,
};
exports.default = formsHandler;
