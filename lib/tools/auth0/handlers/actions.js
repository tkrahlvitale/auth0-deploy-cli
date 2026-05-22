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
exports.isMarketplaceAction = isMarketplaceAction;
const lodash_1 = require("lodash");
const default_1 = __importStar(require("./default"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
const client_1 = require("../client");
const MAX_ACTION_DEPLOY_RETRY_ATTEMPTS = 60; // 60 * 2s => 2 min timeout
// With this schema, we can only validate property types but not valid properties on per type basis
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        required: ['name', 'supported_triggers', 'code'],
        additionalProperties: true,
        properties: {
            code: { type: 'string', default: '' },
            runtime: { type: 'string' },
            dependencies: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                        registry_url: { type: 'string' },
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
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
            name: { type: 'string', default: '' },
            supported_triggers: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', default: '' },
                        version: { type: 'string' },
                        url: { type: 'string' },
                    },
                },
            },
            modules: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['module_name', 'module_version_number'],
                    properties: {
                        module_name: { type: 'string' },
                        module_version_number: { type: 'number' },
                    },
                },
            },
            deployed: { type: 'boolean' },
            status: { type: 'string' },
        },
    },
};
function isActionsDisabled(err) {
    const errorBody = (0, lodash_1.get)(err, 'originalError.response.body') || {};
    return err.statusCode === 403 && errorBody.errorCode === 'feature_not_enabled';
}
function isMarketplaceAction(action) {
    return !!action.integration;
}
class ActionHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'actions',
            functions: {
                create: (action) => this.createAction(action),
                update: (id, action) => this.updateAction(id, action),
                delete: (actionId) => this.deleteAction(actionId),
            },
            stripUpdateFields: ['deployed', 'status'],
        });
    }
    async createAction(action) {
        // Strip the deployed flag
        const addAction = { ...action };
        if ('deployed' in addAction) {
            delete addAction.deployed;
        }
        if ('status' in addAction) {
            delete addAction.status;
        }
        const createdAction = await this.client.actions.create(addAction);
        // Add the action id so we can deploy it later
        if (createdAction?.id) {
            action.id = createdAction.id;
        }
        return createdAction;
    }
    async updateAction(actionId, action) {
        return this.client.actions.update(actionId, action);
    }
    async deleteAction(actionId) {
        if (!this.client.actions || typeof this.client.actions.delete !== 'function') {
            return [];
        }
        return this.client.actions.delete(actionId, { force: true });
    }
    objString(action) {
        return super.objString({ id: action.id, name: action.name });
    }
    async deployActions(actions) {
        await this.client.pool
            .addEachTask({
            data: actions || [],
            generator: (action) => this.deployAction(action)
                .then(() => {
                logger_1.default.info(`Deployed [${this.type}]: ${this.objString(action)}`);
            })
                .catch((err) => {
                throw new Error(`Problem Deploying ${this.type} ${this.objString(action)}\n${err}`);
            }),
        })
            .promise();
    }
    async deployAction(action) {
        try {
            await this.client.actions.deploy(action.id);
        }
        catch (err) {
            // Retry if pending build.
            if (err.message && err.message.includes("must be in the 'built' state")) {
                if (!action.retry_count) {
                    logger_1.default.info(`[${this.type}]: Waiting for build to complete ${this.objString(action)}`);
                    action.retry_count = 1;
                }
                if (action.retry_count > MAX_ACTION_DEPLOY_RETRY_ATTEMPTS) {
                    throw err;
                }
                await (0, utils_1.sleep)(2000);
                action.retry_count += 1;
                await this.deployAction(action);
            }
            else {
                throw err;
            }
        }
    }
    async actionChanges(action, found) {
        const actionChanges = {};
        // if action is deployed, should compare against curren_version - calcDeployedVersionChanges method
        if (!action.deployed) {
            // name or secrets modifications are not supported yet
            if (action.code !== found.code) {
                actionChanges.code = action.code;
            }
            if (action.runtime !== found.runtime) {
                actionChanges.runtime = action.runtime;
            }
            if (!(0, utils_1.areArraysEquals)(action.dependencies, found.dependencies)) {
                actionChanges.dependencies = action.dependencies;
            }
        }
        if (!(0, utils_1.areArraysEquals)(action.supported_triggers, found.supported_triggers)) {
            actionChanges.supported_triggers = action.supported_triggers;
        }
        if (!(0, utils_1.areArraysEquals)(action.modules, found.modules)) {
            actionChanges.modules = action.modules;
        }
        return actionChanges;
    }
    async getType() {
        if (this.existing)
            return this.existing;
        if (!this.client.actions || typeof this.client.actions.list !== 'function') {
            return [];
        }
        // Actions API does not support include_totals param like the other paginate API's.
        // So we set it to false otherwise it will fail with "Additional properties not allowed: include_totals"
        try {
            const actions = await (0, client_1.paginate)(this.client.actions.list, {
                paginate: true,
            });
            this.existing = actions;
            return actions;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return null;
            }
            if (err.statusCode === 500 && err.message === 'An internal server error occurred') {
                throw new Error("Cannot process actions because the actions service is currently unavailable. Retrying may result in a successful operation. Alternatively, adding 'actions' to `AUTH0_EXCLUDED` configuration property will provide ability to skip until service is restored to actions service. This is not an issue with the Deploy CLI.");
            }
            if (isActionsDisabled(err)) {
                logger_1.default.info('Skipping actions because it is not enabled.');
                return null;
            }
            throw err;
        }
    }
    async calcChanges(assets) {
        let { actions } = assets;
        // Do nothing if not set
        if (!actions)
            return {
                del: [],
                create: [],
                update: [],
                conflicts: [],
            };
        let modules = null;
        try {
            modules = await (0, client_1.paginate)(this.client.actions.modules.list, {
                paginate: true,
            });
        }
        catch {
            logger_1.default.debug('Skipping actions modules enrichment because action modules could not be retrieved.');
            modules = null;
        }
        if (modules != null) {
            // Use task queue to process actions in parallel
            const processedActions = await this.client.pool
                .addEachTask({
                data: actions || [],
                generator: (action) => this.enrichActionWithModuleIds(action, modules),
            })
                .promise();
            actions = processedActions;
        }
        return super.calcChanges({ ...assets, actions });
    }
    async dryRunChanges(assets) {
        let { actions, actionModules } = assets;
        if (!actions) {
            return {
                del: [],
                create: [],
                update: [],
                conflicts: [],
            };
        }
        let modules = null;
        if (actionModules && actionModules.length > 0) {
            modules = actionModules;
        }
        else {
            try {
                modules = await (0, client_1.paginate)(this.client.actions.modules.list, {
                    paginate: true,
                });
            }
            catch {
                logger_1.default.debug('Skipping actions modules enrichment because action modules could not be retrieved.');
                modules = null;
            }
        }
        if (modules != null) {
            const processedActions = await this.client.pool
                .addEachTask({
                data: actions || [],
                generator: (action) => this.enrichActionWithModuleIds(action, modules),
            })
                .promise();
            actions = processedActions;
        }
        return super.dryRunChanges({ ...assets, actions });
    }
    async enrichActionWithModuleIds(action, modules) {
        if (!action.modules || action.modules.length === 0) {
            return action;
        }
        // Process modules sequentially to avoid a pool deadlock.
        // This function is called as a task inside the shared pool (via addEachTask in calcChanges).
        // If we submitted further addEachTask calls on the same pool here, all concurrency slots
        // could be held by outer action tasks waiting for inner module tasks that can never start
        // (because no slots are free), causing a hang with 3+ actions that have modules.
        const updatedModules = [];
        for (const module of action.modules) {
            const foundModule = modules.find((m) => m.name === module.module_name);
            if (foundModule && foundModule.id) {
                // paginate to get all versions of the module
                const allModuleVersions = [];
                let moduleVersions = await this.client.actions.modules.versions.list(foundModule.id);
                // Process first page
                allModuleVersions.push(...moduleVersions.data);
                // Fetch remaining pages
                while (moduleVersions.hasNextPage()) {
                    moduleVersions = await moduleVersions.getNextPage();
                    allModuleVersions.push(...moduleVersions.data);
                }
                const moduleVersionId = allModuleVersions?.find((v) => v.version_number === module.module_version_number)?.id;
                if (!moduleVersionId) {
                    throw new Error(`Could not find action module version id for module '${module.module_name}' version '${module.module_version_number}'`);
                }
                updatedModules.push({
                    module_name: module.module_name,
                    module_id: foundModule.id,
                    module_version_number: module.module_version_number,
                    module_version_id: moduleVersionId,
                });
            }
            else {
                updatedModules.push(module);
            }
        }
        return {
            ...action,
            modules: updatedModules,
        };
    }
    async processChanges(assets) {
        const { actions } = assets;
        // Do nothing if not set
        if (!actions)
            return;
        const changes = await this.calcChanges(assets);
        // Management of marketplace actions not currently supported, see ESD-23225.
        const changesWithMarketplaceActionsFiltered = (() => ({
            ...changes,
            del: changes.del.filter((action) => !isMarketplaceAction(action)),
        }))();
        await super.processChanges(assets, changesWithMarketplaceActionsFiltered);
        const postProcessedActions = await (async () => {
            this.existing = null; // Clear the cache
            return this.getType();
        })();
        // Deploy actions
        const deployActions = [
            ...changes.create
                .filter((action) => action.deployed)
                .map((actionWithoutId) => {
                // Add IDs to just-created actions
                const actionId = postProcessedActions?.find((postProcessedAction) => postProcessedAction.name === actionWithoutId.name)?.id;
                const actionWithId = {
                    ...actionWithoutId,
                    id: actionId,
                };
                return actionWithId;
            })
                .filter((action) => !!action.id),
            ...changes.update.filter((action) => action.deployed),
        ];
        await this.deployActions(deployActions);
    }
}
exports.default = ActionHandler;
__decorate([
    (0, default_1.order)('51')
], ActionHandler.prototype, "processChanges", null);
