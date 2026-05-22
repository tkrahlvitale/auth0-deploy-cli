"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const getPromptsDirectory = (filePath) => path_1.default.join(filePath, tools_1.constants.PROMPTS_DIRECTORY);
const getPromptsSettingsFile = (promptsDirectory) => path_1.default.join(promptsDirectory, 'prompts.json');
const getCustomTextFile = (promptsDirectory) => path_1.default.join(promptsDirectory, 'custom-text.json');
const getPartialsFile = (promptsDirectory) => path_1.default.join(promptsDirectory, 'partials.json');
const getScreenRenderSettingsDir = (promptsDirectory) => path_1.default.join(promptsDirectory, tools_1.constants.PROMPTS_SCREEN_RENDER_DIRECTORY);
function parse(context) {
    const promptsDirectory = getPromptsDirectory(context.filePath);
    if (!(0, utils_1.existsMustBeDir)(promptsDirectory))
        return { prompts: null }; // Skip
    const promptsSettings = (() => {
        const promptsSettingsFile = getPromptsSettingsFile(promptsDirectory);
        if (!(0, utils_1.isFile)(promptsSettingsFile))
            return {};
        return (0, utils_1.loadJSON)(promptsSettingsFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
    })();
    const customText = (() => {
        const customTextFile = getCustomTextFile(promptsDirectory);
        if (!(0, utils_1.isFile)(customTextFile))
            return {};
        return (0, utils_1.loadJSON)(customTextFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
    })();
    const partials = (() => {
        const partialsFile = getPartialsFile(promptsDirectory);
        if (!(0, utils_1.isFile)(partialsFile))
            return {};
        const partialsFileContent = (0, utils_1.loadJSON)(partialsFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        return Object.entries(partialsFileContent).reduce((acc, [promptName, screensArray]) => {
            const screensObject = screensArray[0];
            acc[promptName] = Object.entries(screensObject).reduce((screenAcc, [screenName, items]) => {
                screenAcc[screenName] = items.reduce((insertionAcc, { name, template }) => {
                    const templateFilePath = path_1.default.join(promptsDirectory, template);
                    insertionAcc[name] = (0, utils_1.isFile)(templateFilePath)
                        ? (0, tools_1.loadFileAndReplaceKeywords)(templateFilePath, {
                            mappings: context.mappings,
                            disableKeywordReplacement: context.disableKeywordReplacement,
                        }).trim()
                        : '';
                    return insertionAcc;
                }, {});
                return screenAcc;
            }, {});
            return acc;
        }, {});
    })();
    const screenRenderers = (() => {
        const screenRenderSettingsDir = getScreenRenderSettingsDir(promptsDirectory);
        if (!(0, utils_1.existsMustBeDir)(screenRenderSettingsDir))
            return [];
        const screenSettingsFiles = (0, utils_1.getFiles)(screenRenderSettingsDir, ['.json']);
        const renderSettings = screenSettingsFiles.map((f) => {
            const renderSetting = {
                ...(0, utils_1.loadJSON)(f, {
                    mappings: context.mappings,
                    disableKeywordReplacement: context.disableKeywordReplacement,
                }),
            };
            return renderSetting;
        });
        return renderSettings;
    })();
    return {
        prompts: {
            ...promptsSettings,
            customText,
            partials,
            screenRenderers,
        },
    };
}
async function dump(context) {
    const { prompts } = context.assets;
    if (!prompts)
        return;
    const { customText, partials, screenRenderers, ...promptsSettings } = prompts;
    const promptsDirectory = getPromptsDirectory(context.filePath);
    (0, fs_extra_1.ensureDirSync)(promptsDirectory);
    if (!promptsSettings)
        return;
    const promptsSettingsFile = getPromptsSettingsFile(promptsDirectory);
    (0, utils_1.dumpJSON)(promptsSettingsFile, promptsSettings);
    if (!customText)
        return;
    const customTextFile = getCustomTextFile(promptsDirectory);
    (0, utils_1.dumpJSON)(customTextFile, customText);
    if (!partials)
        return;
    const partialsFile = getPartialsFile(promptsDirectory);
    const transformedPartials = Object.entries(partials).reduce((acc, [promptName, screens]) => {
        acc[promptName] = [
            Object.entries(screens).reduce((screenAcc, [screenName, insertionPoints]) => {
                screenAcc[screenName] = Object.entries(insertionPoints).map(([insertionPoint, template]) => {
                    const templateFilePath = path_1.default.join(promptsDirectory, 'partials', promptName, screenName, `${insertionPoint}.liquid`);
                    (0, fs_extra_1.ensureDirSync)(path_1.default.dirname(templateFilePath));
                    (0, fs_extra_1.writeFileSync)(templateFilePath, template, 'utf8');
                    return {
                        name: insertionPoint,
                        template: path_1.default.relative(promptsDirectory, templateFilePath), // Path relative to `promptsDirectory`
                    };
                });
                return screenAcc;
            }, {}),
        ];
        return acc;
    }, {});
    (0, utils_1.dumpJSON)(partialsFile, transformedPartials);
    if (!screenRenderers)
        return;
    const screenRenderSettingsDir = getScreenRenderSettingsDir(promptsDirectory);
    (0, fs_extra_1.ensureDirSync)(screenRenderSettingsDir);
    for (let index = 0; index < screenRenderers.length; index++) {
        const screenRenderersSetting = screenRenderers[index];
        delete screenRenderersSetting.tenant;
        const fileName = `${screenRenderersSetting.prompt}_${screenRenderersSetting.screen}.json`;
        const screenSettingsFilePath = path_1.default.join(screenRenderSettingsDir, fileName);
        (0, utils_1.dumpJSON)(screenSettingsFilePath, screenRenderersSetting);
    }
}
const promptsHandler = {
    parse,
    dump,
};
exports.default = promptsHandler;
