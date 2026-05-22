"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            key: { type: 'string', pattern: '^[A-Za-z0-9_-]*$' },
            value: { type: 'string' },
        },
        required: ['key', 'value'],
    },
    additionalProperties: false,
};
class RulesConfigsHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'rulesConfigs',
            id: 'key',
            functions: {
                update: 'set', // Update or Creation of a ruleConfig is via set not update
            },
        });
    }
    async getType() {
        try {
            const data = await this.client.rulesConfigs.list();
            return data;
        }
        catch (err) {
            if ((0, utils_1.isDeprecatedError)(err))
                return null;
            throw err;
        }
    }
    objString(item) {
        return super.objString({ key: item.key });
    }
    async calcChanges(assets) {
        const { rulesConfigs } = assets;
        // Do nothing if not set
        if (!rulesConfigs || !rulesConfigs.length)
            return {
                del: [],
                update: [],
                create: [],
                conflicts: [],
            };
        logger_1.default.warn('Rules are deprecated, migrate to using actions instead. See: https://auth0.com/docs/customize/actions/migrate/migrate-from-rules-to-actions for more information.');
        // Intention is to not delete/cleanup old configRules, that needs to be handled manually.
        return {
            del: [],
            update: rulesConfigs,
            create: [],
            conflicts: [],
        };
    }
    async dryRunChanges(assets) {
        return this.calcChanges(assets);
    }
}
exports.default = RulesConfigsHandler;
