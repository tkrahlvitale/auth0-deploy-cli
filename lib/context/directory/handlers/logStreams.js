"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const defaults_1 = require("../../defaults");
function parse(context) {
    const logStreamsDirectory = path_1.default.join(context.filePath, tools_1.constants.LOG_STREAMS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(logStreamsDirectory))
        return { logStreams: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(logStreamsDirectory, ['.json']);
    const logStreams = foundFiles
        .map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 0); // Filter out empty rulesConfigs
    return {
        logStreams,
    };
}
async function dump(context) {
    const { logStreams } = context.assets;
    if (!logStreams)
        return; // Skip, nothing to dump
    // Create Rules folder
    const logStreamsDirectory = path_1.default.join(context.filePath, tools_1.constants.LOG_STREAMS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(logStreamsDirectory);
    // masked sensitive fields
    const maskedLogStreams = (0, defaults_1.logStreamDefaults)(logStreams);
    maskedLogStreams.forEach((logStream) => {
        const ruleFile = path_1.default.join(logStreamsDirectory, `${(0, utils_1.sanitize)(logStream.name)}.json`);
        (0, utils_1.dumpJSON)(ruleFile, logStream);
    });
}
const logStreamsHandler = {
    parse,
    dump,
};
exports.default = logStreamsHandler;
