"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const logger_1 = __importDefault(require("../../../logger"));
const getPromptsDirectory = (filePath) => path_1.default.join(filePath, tools_1.constants.PROMPTS_DIRECTORY);
const loadScreenRenderers = (context, screenRenderArray) => {
    // Array to store loaded renderers
    const loadedRenderers = [];
    screenRenderArray.forEach((promptEntry) => {
        // Get the prompt (there will be only one key in each entry)
        const prompt = Object.keys(promptEntry)[0];
        const screens = promptEntry[prompt];
        Object.entries(screens).forEach(([, fileName]) => {
            const filePath = fileName;
            try {
                const rendererFile = path_1.default.join(context.basePath, filePath);
                const rendererData = (0, utils_1.loadJSON)(rendererFile, {
                    mappings: context.mappings,
                    disableKeywordReplacement: context.disableKeywordReplacement,
                });
                // Add to the loadedRenderers array
                loadedRenderers.push(rendererData);
            }
            catch (error) {
                logger_1.default.error(`Error loading file ${fileName}:`, error);
            }
        });
    });
    return loadedRenderers;
};
async function parse(context) {
    const { prompts } = context.assets;
    if (!prompts)
        return { prompts: null };
    if (prompts.screenRenderers && prompts.screenRenderers.length > 0) {
        const screenRendersYAML = prompts.screenRenderers;
        prompts.screenRenderers = loadScreenRenderers(context, screenRendersYAML);
    }
    return {
        prompts,
    };
}
const dumpScreenRenderers = (context, screenRenderers) => {
    const screenRenderArray = [];
    const promptsDirectory = getPromptsDirectory(context.basePath);
    (0, fs_extra_1.ensureDirSync)(promptsDirectory);
    // Create the directory for render settings if it doesn't exist
    const renderSettingsDir = path_1.default.join(promptsDirectory, tools_1.constants.PROMPTS_SCREEN_RENDER_DIRECTORY);
    (0, fs_extra_1.ensureDirSync)(renderSettingsDir);
    screenRenderers.forEach((renderer) => {
        const { tenant, ...screenRendererConfig } = renderer;
        if (!renderer.prompt || !renderer.screen) {
            logger_1.default.error('Invalid screen renderer:', renderer);
            return;
        }
        const fileName = `${renderer.prompt}_${renderer.screen}.json`;
        const filePath = path_1.default.join(renderSettingsDir, fileName);
        logger_1.default.info(`Writing ${filePath}`);
        // Write individual file
        (0, fs_extra_1.writeFileSync)(filePath, JSON.stringify(screenRendererConfig, null, 2));
        // Find or create entry for this prompt in the screenRenderArray
        let promptEntry = screenRenderArray.find((entry) => entry[renderer.prompt]);
        if (!promptEntry) {
            // If no entry exists for this prompt, create a new one
            promptEntry = { [renderer.prompt]: {} };
            screenRenderArray.push(promptEntry);
        }
        // Add screen to the prompt entry
        promptEntry[renderer.prompt][renderer.screen] = `./prompts/${tools_1.constants.PROMPTS_SCREEN_RENDER_DIRECTORY}/${fileName}`;
    });
    return screenRenderArray;
};
async function dump(context) {
    const { prompts } = context.assets;
    if (!prompts)
        return { prompts: null };
    if (prompts.screenRenderers && prompts.screenRenderers.length > 0) {
        prompts.screenRenderers = dumpScreenRenderers(context, prompts.screenRenderers);
    }
    return {
        prompts,
    };
}
const promptsHandler = {
    parse,
    dump,
};
exports.default = promptsHandler;
