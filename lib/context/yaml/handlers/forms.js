"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
const constants_1 = __importDefault(require("../../../tools/constants"));
async function parse(context) {
    const { forms } = context.assets;
    if (!forms)
        return { forms: null };
    const parsedForms = forms.map((form) => {
        const formFile = path_1.default.join(context.basePath, form.body);
        const parsedFormBody = (0, utils_1.loadJSON)(formFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        // Remove the body from the form object
        delete parsedFormBody.body;
        return {
            name: form.name,
            ...parsedFormBody,
        };
    });
    return {
        forms: [...parsedForms],
    };
}
async function dump(context) {
    let { forms } = context.assets;
    if (!forms) {
        return { forms: null };
    }
    const pagesFolder = path_1.default.join(context.basePath, constants_1.default.FORMS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(pagesFolder);
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
    forms = forms.map((form) => {
        if (form.name === undefined) {
            return form;
        }
        const formName = (0, utils_1.sanitize)(form.name);
        const jsonFile = path_1.default.join(pagesFolder, `${formName}.json`);
        logger_1.default.info(`Writing ${jsonFile}`);
        const removeKeysFromOutput = ['id', 'created_at', 'updated_at'];
        removeKeysFromOutput.forEach((key) => {
            if (key in form) {
                delete form[key];
            }
        });
        const jsonBody = JSON.stringify(form, null, 2);
        fs_extra_1.default.writeFileSync(jsonFile, jsonBody);
        return {
            name: form.name,
            body: `./forms/${formName}.json`,
        };
    });
    return { forms };
}
const pagesHandler = {
    parse,
    dump,
};
exports.default = pagesHandler;
