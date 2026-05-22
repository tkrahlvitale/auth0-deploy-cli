"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { riskAssessment } = context.assets;
    if (!riskAssessment)
        return { riskAssessment: null };
    return {
        riskAssessment,
    };
}
async function dump(context) {
    const { riskAssessment } = context.assets;
    if (!riskAssessment)
        return { riskAssessment: null };
    return {
        riskAssessment,
    };
}
const riskAssessmentHandler = {
    parse,
    dump,
};
exports.default = riskAssessmentHandler;
