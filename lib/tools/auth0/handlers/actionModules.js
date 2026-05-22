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
const default_1 = __importStar(require("./default"));
const logger_1 = __importDefault(require("../../../logger"));
const client_1 = require("../client");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        required: ['name', 'code'],
        additionalProperties: true,
        properties: {
            name: { type: 'string' },
            code: { type: 'string' },
            dependencies: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                    },
                },
            },
            secrets: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        value: { type: 'string' },
                    },
                    required: ['name'],
                },
            },
            all_changes_published: { type: 'boolean' },
        },
    },
};
class ActionModulesHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'actionModules',
            id: 'id',
            identifiers: ['id', 'name'],
            stripUpdateFields: [
                'name',
                'actions_using_module_total',
                'all_changes_published',
                'latest_version_number',
                'created_at',
                'updated_at',
            ],
            stripCreateFields: [
                'actions_using_module_total',
                'latest_version_number',
                'created_at',
                'updated_at',
            ],
            functions: {
                create: (module) => this.createModule(module),
                update: (id, module) => this.updateModule(id, module),
                delete: (id) => this.deleteModule(id),
            },
        });
    }
    async createModule(module) {
        if ('all_changes_published' in module) {
            delete module.all_changes_published;
        }
        const createdModule = await this.client.actions.modules.create(module);
        return createdModule;
    }
    async updateModule(moduleId, module) {
        const updatableModule = {
            code: module.code,
            dependencies: module.dependencies,
            secrets: module.secrets,
        };
        return this.client.actions.modules.update(moduleId, updatableModule);
    }
    async deleteModule(moduleId) {
        return this.client.actions.modules.delete(moduleId);
    }
    objString(module) {
        return super.objString({ id: module.id, name: module.name });
    }
    async publishActionModules(modules) {
        await this.client.pool
            .addEachTask({
            data: modules || [],
            generator: (module) => this.client.actions.modules.versions
                .create(module.id)
                .then(() => {
                logger_1.default.info(`Published [${this.type}]: ${this.objString(module)}`);
            })
                .catch((err) => {
                throw new Error(`Problem Publishing ${this.type} ${this.objString(module)}\n${err}`);
            }),
        })
            .promise();
    }
    async getType() {
        if (this.existing)
            return this.existing;
        try {
            const modules = await (0, client_1.paginate)(this.client.actions.modules.list, {
                paginate: true,
            });
            this.existing = modules;
            return this.existing;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return null;
            }
            if (err.statusCode === 403 || err.errorCode === 'feature_not_enabled') {
                logger_1.default.debug('Skipping action modules because it is not enabled.');
                return null;
            }
            throw err;
        }
    }
    // Before actions are processed
    async processChanges(assets) {
        const { actionModules } = assets;
        // Do nothing if not set
        if (!actionModules)
            return;
        const changes = await this.calcChanges(assets);
        await super.processChanges(assets, changes);
        // Refresh module list to get latest state with all_changes_published field
        const postProcessedModules = await (async () => {
            this.existing = null; // Clear the cache
            return this.getType();
        })();
        // Publish modules that have unpublished changes
        const modulesToPublish = [
            ...changes.create
                .filter((module) => module.all_changes_published === true)
                .map((moduleWithoutId) => {
                // Add IDs to just-created modules
                const moduleId = postProcessedModules?.find((postProcessedModule) => postProcessedModule.name === moduleWithoutId.name)?.id;
                const module = postProcessedModules?.find((postProcessedModule) => postProcessedModule.id === moduleId);
                return module;
            }),
            ...changes.update.filter((module) => module.all_changes_published === true),
        ].filter((module) => module !== undefined);
        await this.publishActionModules(modulesToPublish);
    }
}
exports.default = ActionModulesHandler;
__decorate([
    (0, default_1.order)('50')
], ActionModulesHandler.prototype, "processChanges", null);
