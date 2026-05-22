"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
const tools_1 = require("../../../tools");
async function parse(context) {
    const { flows } = context.assets;
    if (!flows)
        return { flows: null };
    const parsedFlows = flows.map((flow) => {
        const flowFile = path_1.default.join(context.basePath, flow.body);
        const parsedFlowBody = (0, utils_1.loadJSON)(flowFile, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        // Remove the body from the form object
        delete parsedFlowBody.body;
        return {
            name: flow.name,
            ...parsedFlowBody,
        };
    });
    return {
        flows: [...parsedFlows],
    };
}
async function dump(context) {
    let { flows } = context.assets;
    if (!flows) {
        return { flows: null };
    }
    const pagesFolder = path_1.default.join(context.basePath, tools_1.constants.FLOWS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(pagesFolder);
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
    flows = flows.map((flow) => {
        if (flow.name === undefined) {
            return flow;
        }
        const flowName = (0, utils_1.sanitize)(flow.name);
        const jsonFile = path_1.default.join(pagesFolder, `${flowName}.json`);
        logger_1.default.info(`Writing ${jsonFile}`);
        const removeKeysFromOutput = ['id', 'created_at', 'updated_at', 'submitted_at', 'embedded_at'];
        removeKeysFromOutput.forEach((key) => {
            if (key in flow) {
                delete flow[key];
            }
        });
        const jsonBody = JSON.stringify(flow, null, 2);
        fs_extra_1.default.writeFileSync(jsonFile, jsonBody);
        return {
            name: flow.name,
            body: `./flows/${flowName}.json`,
        };
    });
    return { flows };
}
const pagesHandler = {
    parse,
    dump,
};
exports.default = pagesHandler;
