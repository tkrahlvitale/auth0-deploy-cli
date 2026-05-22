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
    const riskAssessmentDirectory = path_1.default.join(context.filePath, tools_1.constants.RISK_ASSESSMENT_DIRECTORY);
    const riskAssessmentFile = path_1.default.join(riskAssessmentDirectory, 'settings.json');
    if (!(0, utils_1.existsMustBeDir)(riskAssessmentDirectory)) {
        return { riskAssessment: null };
    }
    if (!(0, utils_1.isFile)(riskAssessmentFile)) {
        return { riskAssessment: null };
    }
    const riskAssessment = (0, utils_1.loadJSON)(riskAssessmentFile, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    });
    return {
        riskAssessment,
    };
}
async function dump(context) {
    const { riskAssessment } = context.assets;
    if (!riskAssessment)
        return;
    const riskAssessmentDirectory = path_1.default.join(context.filePath, tools_1.constants.RISK_ASSESSMENT_DIRECTORY);
    const riskAssessmentFile = path_1.default.join(riskAssessmentDirectory, 'settings.json');
    fs_extra_1.default.ensureDirSync(riskAssessmentDirectory);
    (0, utils_1.dumpJSON)(riskAssessmentFile, riskAssessment);
}
const riskAssessmentHandler = {
    parse,
    dump,
};
exports.default = riskAssessmentHandler;
