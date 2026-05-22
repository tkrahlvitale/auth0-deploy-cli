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
async function parse(context) {
    if (!context.assets.branding)
        return { branding: null };
    const { branding: { templates, ...branding }, } = context.assets;
    if (!templates) {
        return { branding: { ...branding } };
    }
    const parsedTemplates = templates.map((templateDefinition) => {
        const normalizedPathArray = (0, utils_1.nomalizedYAMLPath)(templateDefinition.body);
        const markupFile = path_1.default.join(context.basePath, ...normalizedPathArray);
        return {
            template: templateDefinition.template,
            body: (0, tools_1.loadFileAndReplaceKeywords)(markupFile, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
    });
    return {
        branding: {
            ...branding,
            templates: parsedTemplates,
        },
    };
}
async function dump(context) {
    if (!context.assets.branding)
        return { branding: null };
    const { templates: templateConfig, ...branding } = context.assets.branding;
    let templates = templateConfig || [];
    // create templates folder
    if (templates.length) {
        const brandingTemplatesFolder = path_1.default.join(context.basePath, tools_1.constants.BRANDING_TEMPLATES_YAML_DIRECTORY);
        fs_extra_1.default.ensureDirSync(brandingTemplatesFolder);
        templates = templates.map((templateDefinition) => {
            const file = `${templateDefinition.template}.html`;
            const templateMarkupFile = path_1.default.join(brandingTemplatesFolder, file);
            logger_1.default.info(`Writing ${templateMarkupFile}`);
            const markup = templateDefinition.body;
            try {
                fs_extra_1.default.writeFileSync(templateMarkupFile, markup);
            }
            catch (e) {
                throw new Error(`Error writing template file: ${templateDefinition.template}, because: ${e.message}`);
            }
            // save the location as relative file.
            templateDefinition.body = `./${tools_1.constants.BRANDING_TEMPLATES_YAML_DIRECTORY}/${file}`;
            return templateDefinition;
        });
    }
    return { branding: { templates, ...branding } };
}
const brandingHandler = {
    parse,
    dump,
};
exports.default = brandingHandler;
