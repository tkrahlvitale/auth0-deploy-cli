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
const auth0_1 = require("auth0");
const default_1 = __importStar(require("./default"));
const logger_1 = __importDefault(require("../../../logger"));
exports.schema = {
    type: 'object',
    properties: {
        akamai_enabled: {
            type: 'boolean',
            description: 'Enable Akamai supplemental signals integration',
        },
    },
};
class SupplementalSignalsHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'supplementalSignals',
        });
    }
    async getType() {
        try {
            const supplementalSignals = await this.client.supplementalSignals.get();
            this.existing = supplementalSignals;
            return supplementalSignals;
        }
        catch (err) {
            if (err instanceof auth0_1.ManagementError && err.statusCode === 403) {
                logger_1.default.debug('Supplemental Signals unavailable: insufficient scope or missing attack_protection entitlement.');
                return null;
            }
            throw err;
        }
    }
    async processChanges(assets) {
        const { supplementalSignals } = assets;
        if (!supplementalSignals)
            return;
        if (Object.keys(supplementalSignals).length > 0) {
            try {
                await this.client.supplementalSignals.patch(supplementalSignals);
                this.updated += 1;
                this.didUpdate(supplementalSignals);
            }
            catch (err) {
                if (err instanceof auth0_1.ManagementError && err.statusCode === 403) {
                    logger_1.default.debug('Supplemental Signals unavailable: insufficient scope or missing attack_protection entitlement.');
                    return;
                }
                throw err;
            }
        }
    }
}
exports.default = SupplementalSignalsHandler;
__decorate([
    (0, default_1.order)('100')
], SupplementalSignalsHandler.prototype, "processChanges", null);
