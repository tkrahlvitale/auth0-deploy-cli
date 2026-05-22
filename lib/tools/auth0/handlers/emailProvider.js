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
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const lodash_1 = require("lodash");
const utils_1 = require("../../utils");
const default_1 = __importStar(require("./default"));
exports.schema = { type: 'object' };
// The Management API requires the fields to be specified
const defaultFields = ['name', 'enabled', 'credentials', 'settings', 'default_from_address'];
class EmailProviderHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'emailProvider',
            ignoreDryRunFields: ['smtp.credentials.smtp_pass', 'mandrill.credentials.api_key'],
        });
    }
    async getType() {
        try {
            const emailProvider = await this.client.emails.provider.get({
                include_fields: true,
                fields: defaultFields.join(','),
            });
            return emailProvider;
        }
        catch (err) {
            if (err.statusCode === 404)
                return {};
            throw err;
        }
    }
    objString(provider) {
        return super.objString({ name: provider.name, enabled: provider.enabled });
    }
    async processChanges(assets) {
        const { emailProvider } = assets;
        if (!emailProvider)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        const existing = await this.getType();
        // HTTP DELETE on emails/provider is not supported, as this is not part of our vNext SDK.
        if (Object.keys(emailProvider).length === 0) {
            if (this.config('AUTH0_ALLOW_DELETE') === true) {
                // If no existing provider, there is nothing to delete
                if (!existing.name)
                    return;
                // await this.client.emails.delete(); is not supported
                if ((0, lodash_1.isEmpty)(existing.credentials)) {
                    delete existing.credentials;
                }
                const updated = await this.client.emails.provider.update(existing);
                this.updated += 1;
                this.didUpdate(updated);
            }
            return;
        }
        if (existing.name) {
            const updated = await this.client.emails.provider.update(emailProvider);
            this.updated += 1;
            this.didUpdate(updated);
        }
        else {
            const created = await this.client.emails.provider.create(emailProvider);
            this.created += 1;
            this.didCreate(created);
        }
    }
}
exports.default = EmailProviderHandler;
__decorate([
    (0, default_1.order)('60')
], EmailProviderHandler.prototype, "processChanges", null);
