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
    const brandingDirectory = path_1.default.join(context.filePath, tools_1.constants.BRANDING_DIRECTORY);
    const brandingFile = path_1.default.join(brandingDirectory, 'branding.json');
    if (!(0, utils_1.existsMustBeDir)(brandingDirectory))
        return { branding: null };
    const brandingSettings = (() => {
        if ((0, utils_1.isFile)(brandingFile)) {
            return (0, utils_1.loadJSON)(brandingFile, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            });
        }
        return null;
    })();
    const brandingTemplatesFolder = path_1.default.join(brandingDirectory, tools_1.constants.BRANDING_TEMPLATES_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(brandingTemplatesFolder))
        return { branding: brandingSettings };
    const templatesDefinitionFiles = (0, utils_1.getFiles)(brandingTemplatesFolder, ['.json']);
    const templates = templatesDefinitionFiles.map((templateDefinitionFile) => {
        const definition = (0, utils_1.loadJSON)(templateDefinitionFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        const normalizedPathArray = (0, utils_1.nomalizedYAMLPath)(definition.body);
        definition.body = (0, tools_1.loadFileAndReplaceKeywords)(path_1.default.join(brandingTemplatesFolder, ...normalizedPathArray), {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        return definition;
    }, {});
    return {
        branding: {
            ...brandingSettings,
            templates,
        },
    };
}
async function dump(context) {
    const { branding } = context.assets;
    if (!branding)
        return;
    dumpBranding(context);
    if (!!branding.templates)
        dumpBrandingTemplates(context);
}
const dumpBrandingTemplates = ({ filePath, assets }) => {
    if (!assets.branding || !assets.branding.templates)
        return;
    const { branding: { templates = [] }, } = assets;
    const brandingTemplatesFolder = path_1.default.join(filePath, tools_1.constants.BRANDING_DIRECTORY, tools_1.constants.BRANDING_TEMPLATES_DIRECTORY);
    fs_extra_1.default.ensureDirSync(brandingTemplatesFolder);
    templates.forEach((templateDefinition) => {
        const markup = templateDefinition.body;
        try {
            fs_extra_1.default.writeFileSync(path_1.default.join(brandingTemplatesFolder, `${templateDefinition.template}.html`), markup);
        }
        catch (e) {
            throw new Error(`Error writing template file: ${templateDefinition.template}, because: ${e.message}`);
        }
        // save the location as relative file.
        templateDefinition.body = `./${templateDefinition.template}.html`;
        (0, utils_1.dumpJSON)(path_1.default.join(brandingTemplatesFolder, `${templateDefinition.template}.json`), templateDefinition);
    });
};
const dumpBranding = ({ filePath, assets }) => {
    if (!assets || !assets.branding)
        return;
    const { branding } = assets;
    const brandingWithoutTemplates = (() => {
        const newBranding = { ...branding };
        delete newBranding.templates;
        return newBranding;
    })();
    const brandingDirectory = path_1.default.join(filePath, tools_1.constants.BRANDING_DIRECTORY);
    fs_extra_1.default.ensureDirSync(brandingDirectory);
    const brandingFilePath = path_1.default.join(brandingDirectory, 'branding.json');
    (0, utils_1.dumpJSON)(brandingFilePath, brandingWithoutTemplates);
};
const brandingHandler = {
    parse,
    dump,
};
exports.default = brandingHandler;
