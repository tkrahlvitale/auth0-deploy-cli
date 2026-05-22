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
    const flowsFolder = path_1.default.join(context.filePath, tools_1.constants.FLOWS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(flowsFolder))
        return { flows: null }; // Skip
    const files = (0, utils_1.getFiles)(flowsFolder, ['.json']);
    const flows = files.map((f) => {
        const flow = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return flow;
    });
    return {
        flows,
    };
}
async function dump(context) {
    const { flows } = context.assets;
    if (!flows)
        return; // Skip, nothing to dump
    const flowsFolder = path_1.default.join(context.filePath, tools_1.constants.FLOWS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(flowsFolder);
    // Check if there is any duplicate flow name
    const flowNameSet = new Set();
    const duplicateFlowNames = new Set();
    flows.forEach((flow) => {
        if (flowNameSet.has(flow.name)) {
            duplicateFlowNames.add(flow.name);
        }
        else {
            flowNameSet.add(flow.name);
        }
    });
    if (duplicateFlowNames.size > 0) {
        const duplicateNamesArray = Array.from(duplicateFlowNames).join(', ');
        logger_1.default.error(`Duplicate flow names found: [${duplicateNamesArray}] , make sure to rename them to avoid conflicts`);
        throw new Error(`Duplicate flow names found: ${duplicateNamesArray}`);
    }
    flows.forEach((flow) => {
        if (flow.name === undefined) {
            return;
        }
        const flowFile = path_1.default.join(flowsFolder, (0, utils_1.sanitize)(`${flow.name}.json`));
        logger_1.default.info(`Writing ${flowFile}`);
        const removeKeysFromOutput = ['id', 'created_at', 'updated_at', 'submitted_at', 'embedded_at'];
        removeKeysFromOutput.forEach((key) => {
            if (key in flow) {
                delete flow[key];
            }
        });
        (0, utils_1.dumpJSON)(flowFile, flow);
    });
}
const flowsHandler = {
    parse,
    dump,
};
exports.default = flowsHandler;
