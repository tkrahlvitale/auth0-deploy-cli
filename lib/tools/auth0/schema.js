"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = __importDefault(require("./handlers"));
const typesSchema = Object.entries(handlers_1.default).reduce((map, [name, obj]) => {
    map[name] = obj.schema; //eslint-disable-line
    return map;
}, {});
const excludeSchema = Object.entries(handlers_1.default).reduce((map, [name, obj]) => {
    if (obj.excludeSchema) {
        map[name] = obj.excludeSchema;
    }
    return map;
}, {});
const includeSchema = Object.entries(handlers_1.default).reduce((map, [name, obj]) => {
    if (obj.includeSchema) {
        map[name] = obj.includeSchema;
    }
    return map;
}, {});
exports.default = {
    type: 'object',
    $schema: 'http://json-schema.org/draft-07/schema#',
    properties: {
        ...typesSchema,
        exclude: {
            type: 'object',
            properties: { ...excludeSchema },
            default: {},
        },
        include: {
            type: 'object',
            properties: { ...includeSchema },
            default: {},
        },
    },
    additionalProperties: false,
};
