"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs_1 = require("fs");
const tools_1 = require("../../../tools");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
function parse(context) {
    const emailsFolder = path_1.default.join(context.filePath, tools_1.constants.EMAIL_TEMPLATES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(emailsFolder))
        return { emailTemplates: null }; // Skip
    const jsonFiles = (0, utils_1.getFiles)(emailsFolder, ['.json']).filter((f) => path_1.default.basename(f) !== 'provider.json');
    const emailTemplates = jsonFiles.flatMap((filePath) => {
        const meta = (0, utils_1.loadJSON)(filePath, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        const templateFilePath = (() => {
            if (meta.body !== undefined) {
                const explicitlyDefinedPath = path_1.default.join(emailsFolder, meta.body);
                if ((0, fs_1.existsSync)(explicitlyDefinedPath))
                    return explicitlyDefinedPath;
            }
            const defaultPath = path_1.default.join(emailsFolder, path_1.default.parse(filePath).name + '.html');
            if ((0, fs_1.existsSync)(defaultPath))
                return defaultPath;
            return null;
        })();
        if (templateFilePath === null) {
            logger_1.default.warn(`Skipping email template file ${meta.body} as missing the corresponding '.json' file`);
            return [];
        }
        return {
            ...meta,
            body: (0, tools_1.loadFileAndReplaceKeywords)(templateFilePath, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
    });
    return {
        emailTemplates,
    };
}
async function dump(context) {
    const { emailTemplates } = context.assets;
    if (!emailTemplates)
        return; // Skip, nothing to dump
    // Create Templates folder
    const templatesFolder = path_1.default.join(context.filePath, tools_1.constants.EMAIL_TEMPLATES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(templatesFolder);
    emailTemplates.forEach((template) => {
        // Dump template html to file
        const templateHtml = path_1.default.join(templatesFolder, `${template.template}.html`);
        logger_1.default.info(`Writing ${templateHtml}`);
        fs_extra_1.default.writeFileSync(templateHtml, template.body);
        // Dump template metadata
        const templateFile = path_1.default.join(templatesFolder, `${template.template}.json`);
        (0, utils_1.dumpJSON)(templateFile, { ...template, body: `./${template.template}.html` });
    });
}
const emailTemplatesHandler = {
    parse,
    dump,
};
exports.default = emailTemplatesHandler;
