"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const lodash_1 = require("lodash");
const dot_prop_1 = __importDefault(require("dot-prop"));
const default_1 = __importStar(require("./default"));
const client_1 = require("../client");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
const utils_2 = require("../../../utils");
const flowVaultConnections_1 = require("./flowVaultConnections");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            body: { type: 'string' },
        },
        required: ['name'],
    },
    additionalProperties: false,
};
class FlowHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'flows',
            id: 'id',
            stripCreateFields: ['created_at', 'updated_at', 'executed_at'],
            stripUpdateFields: ['created_at', 'updated_at', 'executed_at'],
        });
    }
    objString(item) {
        return super.objString({ id: item.id, name: item.name });
    }
    async getFlows(flows) {
        const allFlows = await this.client.pool
            .addEachTask({
            data: flows,
            generator: ({ id }) => this.client.flows.get(id).then((response) => {
                if ((0, lodash_1.isEmpty)(response))
                    return null;
                return response;
            }),
        })
            .promise();
        return allFlows.filter((flow) => flow !== null);
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        const [flows, allFlowConnections] = await Promise.all([
            (0, client_1.paginate)(this.client.flows.list, {
                paginate: true,
            }),
            (0, flowVaultConnections_1.getAllFlowConnections)(this.client),
        ]);
        // get more details for each flows
        const allFlows = await this.getFlows(flows);
        // create a map for id to name from allFlowConnections
        const connectionIdMap = {};
        allFlowConnections.forEach((c) => {
            connectionIdMap[c.id] = c.name;
        });
        this.existing = await this.formateFlowConnectionId(allFlows, connectionIdMap);
        return this.existing;
    }
    async processChanges(assets) {
        const { flows } = assets;
        // Do nothing if not set
        if (!flows)
            return;
        const { del, update, create, conflicts } = await this.calcChanges(assets);
        if ((0, utils_1.isDryRun)(this.config)) {
            if (create.length === 0 &&
                update.length === 0 &&
                del.length === 0 &&
                conflicts.length === 0) {
                return;
            }
        }
        const allFlowConnections = await (0, flowVaultConnections_1.getAllFlowConnections)(this.client);
        // create a map for name to id from allFlowConnections
        const connectionNameMap = {};
        allFlowConnections.forEach((c) => {
            connectionNameMap[c.name] = c.id;
        });
        assets.flows = await this.pargeFlowConnectionName(flows, connectionNameMap);
        const changes = {
            del: del,
            update: update,
            create: create,
            conflicts: conflicts,
        };
        await super.processChanges(assets, {
            ...changes,
        });
    }
    async formateFlowConnectionId(flows, connectionIdMap) {
        // replace connection_id with flow connection names
        await Promise.all(flows.map(async (flow) => {
            const flowConnetions = (0, utils_2.findKeyPathWithValue)(flow, 'connection_id');
            await Promise.all(flowConnetions.map(async (f) => {
                const connectionId = (dot_prop_1.default.get(flow, f.path) || '');
                const flowConnectionName = connectionIdMap[connectionId];
                if (!flowConnectionName) {
                    logger_1.default.warn(`Flow connection: ${connectionId} not found for flow:${flow.name}, please verify the flow connection id.`);
                }
                else {
                    dot_prop_1.default.set(flow, f.path, flowConnectionName);
                }
            }));
            return flow;
        }));
        return flows;
    }
    async pargeFlowConnectionName(flows, connectionNameMap) {
        // replace connection_id with flow connection names
        const parsedFlows = await Promise.all(flows.map(async (flow) => {
            const flowConnetions = (0, utils_2.findKeyPathWithValue)(flow, 'connection_id');
            await Promise.all(flowConnetions.map(async (f) => {
                const connectionName = (dot_prop_1.default.get(flow, f.path) || '');
                const flowConnectionId = connectionNameMap[connectionName];
                if (!flowConnectionId) {
                    logger_1.default.error(`Flow connection: ${flowConnectionId} not found for flow:${flow.name}, please verify the flow connection name.`);
                }
                else {
                    dot_prop_1.default.set(flow, f.path, flowConnectionId);
                }
            }));
            return flow;
        }));
        return parsedFlows;
    }
}
exports.default = FlowHandler;
__decorate([
    (0, default_1.order)('80')
], FlowHandler.prototype, "processChanges", null);
