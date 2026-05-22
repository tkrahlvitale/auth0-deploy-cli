"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const utils_1 = require("../../utils");
exports.schema = {
    type: 'object',
    properties: {
        policies: {
            type: 'array',
            items: {
                type: 'string',
                enum: constants_1.default.GUARDIAN_POLICIES,
            },
        },
    },
    additionalProperties: false,
};
class GuardianPoliciesHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'guardianPolicies',
        });
    }
    // TODO: standardize empty object literal with more intentional empty indicator
    async getType() {
        if (this.existing)
            return this.existing;
        const policies = await this.client.guardian.policies.list();
        this.existing = { policies };
        return this.existing;
    }
    async processChanges(assets) {
        // No API to delete or create guardianPolicies, we can only update.
        const { guardianPolicies } = assets;
        // Do nothing if not set
        if (!guardianPolicies || !guardianPolicies.policies)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        const data = guardianPolicies.policies;
        await this.client.guardian.policies.set(data);
        this.updated += 1;
        this.didUpdate(guardianPolicies);
    }
}
exports.default = GuardianPoliciesHandler;
