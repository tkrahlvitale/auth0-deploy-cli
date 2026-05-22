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
const lodash_1 = __importDefault(require("lodash"));
const default_1 = __importStar(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
exports.schema = {
    type: 'object',
    items: {
        type: 'object',
        additionalProperties: true,
        properties: {
            trigger_id: {
                type: 'object',
                properties: {
                    action_name: { type: 'string', enum: constants_1.default.ACTIONS_TRIGGERS },
                    display_name: { type: 'string', default: '' },
                },
            },
        },
    },
};
function isActionsDisabled(err) {
    const errorBody = lodash_1.default.get(err, 'originalError.response.body') || {};
    return err.statusCode === 403 && errorBody.errorCode === 'feature_not_enabled';
}
class TriggersHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'triggers',
            id: 'name',
        });
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        const triggerBindings = {};
        try {
            const res = await this.client.actions.triggers.list();
            const triggers = (0, lodash_1.default)(res?.triggers).map('id').uniq().value();
            for (let i = 0; i < triggers.length; i++) {
                const triggerId = triggers[i];
                let bindings;
                try {
                    const { data } = await this.client.actions.triggers.bindings.list(triggerId);
                    bindings = data;
                }
                catch (err) {
                    logger_1.default.warn(`${err.message} (trigger: ${triggerId}). Skipping this trigger and continuing.`);
                    bindings = null;
                }
                if (bindings && bindings.length > 0) {
                    triggerBindings[triggerId] = bindings.map((binding) => ({
                        action_name: binding.action.name,
                        display_name: binding.display_name,
                    }));
                }
            }
            this.existing = triggerBindings;
            return this.existing;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return [];
            }
            if (isActionsDisabled(err)) {
                logger_1.default.info('Skipping triggers because Actions is not enabled.');
                return {};
            }
            throw err;
        }
    }
    async processChanges(assets) {
        // No API to delete or create triggers, we can only update.
        const { triggers } = assets;
        // Do nothing if not set
        if (!triggers)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { update } = await this.calcChanges(assets);
            if (update.length === 0) {
                return;
            }
        }
        await (0, utils_1.sleep)(2000); // Delay to allow newly-deployed actions to register in backend
        await Promise.all(Object.entries(triggers).map(async ([name, data]) => {
            const bindings = data.map((binding) => ({
                ref: {
                    type: 'action_name',
                    value: binding.action_name,
                },
                display_name: binding.display_name,
            }));
            await this.client.actions.triggers.bindings.updateMany(name, { bindings });
            this.didUpdate({ trigger_id: name });
            this.updated += 1;
        }));
    }
}
exports.default = TriggersHandler;
__decorate([
    (0, default_1.order)('80')
], TriggersHandler.prototype, "processChanges", null);
