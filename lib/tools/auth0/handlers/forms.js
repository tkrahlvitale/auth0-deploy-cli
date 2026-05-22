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
const dot_prop_1 = __importDefault(require("dot-prop"));
const lodash_1 = require("lodash");
const default_1 = __importStar(require("./default"));
const logger_1 = __importDefault(require("../../../logger"));
const client_1 = require("../client");
const utils_1 = require("../../../utils");
const utils_2 = require("../../utils");
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
class FormsHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'forms',
            id: 'id',
            stripCreateFields: ['created_at', 'updated_at', 'submitted_at', 'embedded_at'],
            stripUpdateFields: ['created_at', 'updated_at', 'submitted_at', 'embedded_at'],
        });
    }
    objString(item) {
        return super.objString({ id: item.id, name: item.name });
    }
    async getForms(forms) {
        const allForms = await this.client.pool
            .addEachTask({
            data: forms,
            generator: ({ id }) => this.client.forms.get(id).then((response) => {
                if ((0, lodash_1.isEmpty)(response))
                    return null;
                return response;
            }),
        })
            .promise();
        return allForms.filter((form) => form !== null);
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        const [forms, flows] = await Promise.all([
            (0, client_1.paginate)(this.client.forms.list, {
                paginate: true,
            }),
            (0, client_1.paginate)(this.client.flows.list, {
                paginate: true,
            }),
        ]);
        // get more details for each form
        const allForms = await this.getForms(forms);
        // create a map for id to name from allFlows
        const flowIdMap = {};
        flows.forEach((f) => {
            flowIdMap[f.id] = f.name;
        });
        this.existing = await this.formateFormFlowId(allForms, flowIdMap);
        return this.existing;
    }
    async formateFormFlowId(forms, flowIdMap) {
        // replace flow_id with flow names
        await Promise.all(forms.map(async (form) => {
            const flows = (0, utils_1.findKeyPathWithValue)(form, 'flow_id');
            await Promise.all(flows.map(async (f) => {
                const flowId = (dot_prop_1.default.get(form, f.path) || '');
                const flowName = flowIdMap[flowId];
                if (!flowName) {
                    logger_1.default.warn(`Flow: ${flowId} not found for form:${form.name}, please verify the flow id.`);
                }
                else {
                    dot_prop_1.default.set(form, f.path, flowName);
                }
            }));
            return form;
        }));
        return forms;
    }
    async pargeFormFlowName(forms, flowNameMap) {
        // replace flow names with flow_id
        await Promise.all(forms.map(async (form) => {
            const flows = (0, utils_1.findKeyPathWithValue)(form, 'flow_id');
            await Promise.all(flows.map(async (f) => {
                const flowName = (dot_prop_1.default.get(form, f.path) || '');
                const flowId = flowNameMap[flowName];
                if (!flowId) {
                    logger_1.default.error(`Flow: ${flowName} not found for form:${form.name}, please verify the flow name.`);
                }
                else {
                    dot_prop_1.default.set(form, f.path, flowNameMap[flowName]);
                }
            }));
            return form;
        }));
        return forms;
    }
    async processChanges(assets) {
        const { forms } = assets;
        // Do nothing if not set
        if (!forms)
            return;
        const { del, update, create, conflicts } = await this.calcChanges(assets);
        if ((0, utils_2.isDryRun)(this.config)) {
            if (create.length === 0 &&
                update.length === 0 &&
                del.length === 0 &&
                conflicts.length === 0) {
                return;
            }
        }
        const flows = await (0, client_1.paginate)(this.client.flows.list, {
            paginate: true,
            include_totals: true,
        });
        // create a map for id to name from flows
        const flowNamMap = {};
        flows.forEach((f) => {
            flowNamMap[f.name] = f.id;
        });
        assets.forms = await this.pargeFormFlowName(forms, flowNamMap);
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
}
exports.default = FormsHandler;
__decorate([
    (0, default_1.order)('90')
], FormsHandler.prototype, "processChanges", null);
