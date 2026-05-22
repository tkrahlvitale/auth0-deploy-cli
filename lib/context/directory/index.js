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
const path = __importStar(require("path"));
const tools_1 = require("../../tools");
const client_1 = __importDefault(require("../../tools/auth0/client"));
const readonly_1 = __importDefault(require("../../readonly"));
const logger_1 = __importDefault(require("../../logger"));
const handlers_1 = __importDefault(require("./handlers"));
const utils_1 = require("../../utils");
const __1 = require("..");
const keywordPreservation_1 = require("../../keywordPreservation");
class DirectoryContext {
    constructor(config, mgmtClient) {
        this.filePath = config.AUTH0_INPUT_FILE;
        this.config = config;
        this.mappings = config.AUTH0_KEYWORD_REPLACE_MAPPINGS || {};
        this.mgmtClient = (0, client_1.default)(mgmtClient);
        this.disableKeywordReplacement = false;
        //@ts-ignore for now
        this.assets = {};
        // Get excluded rules
        this.assets.exclude = {
            rules: config.AUTH0_EXCLUDED_RULES || [],
            clients: config.AUTH0_EXCLUDED_CLIENTS || [],
            databases: config.AUTH0_EXCLUDED_DATABASES || [],
            connections: config.AUTH0_EXCLUDED_CONNECTIONS || [],
            resourceServers: config.AUTH0_EXCLUDED_RESOURCE_SERVERS || [],
            defaults: config.AUTH0_EXCLUDED_DEFAULTS || [],
        };
        this.assets.include = {
            connections: config.AUTH0_INCLUDED_CONNECTIONS || [],
        };
    }
    loadFile(f, folder) {
        const basePath = path.join(this.filePath, folder);
        let toLoad = path.join(basePath, f);
        if (!(0, utils_1.isFile)(toLoad)) {
            // try load not relative to yaml file
            toLoad = f;
            logger_1.default.warn(`Support for absolute paths and paths outside the config root will be deprecated in a future version to improve the security of the tool. ` +
                `Please update your configuration to use paths relative to the config directory. ` +
                `Current absolute path used: ["${f}"]`);
        }
        return (0, tools_1.loadFileAndReplaceKeywords)(toLoad, {
            mappings: this.mappings,
            disableKeywordReplacement: this.disableKeywordReplacement,
        });
    }
    async loadAssetsFromLocal(opts = { disableKeywordReplacement: false }) {
        this.disableKeywordReplacement = opts.disableKeywordReplacement;
        if ((0, utils_1.isDirectory)(this.filePath)) {
            /* If this is a directory, look for each file in the directory */
            logger_1.default.info(`Processing directory ${this.filePath}`);
            Object.entries(handlers_1.default)
                .filter(([handlerName]) => {
                const excludedAssetTypes = this.config.AUTH0_EXCLUDED || [];
                return !excludedAssetTypes.includes(handlerName);
            })
                .filter((0, __1.filterOnlyIncludedResourceTypes)(this.config.AUTH0_INCLUDED_ONLY))
                .forEach(([_name, handler]) => {
                const parsed = handler.parse(this);
                Object.entries(parsed).forEach(([k, v]) => {
                    this.assets[k] = v;
                });
            });
            return;
        }
        throw new Error(`Not sure what to do with, ${this.filePath} as it is not a directory...`);
    }
    async dump() {
        const auth0 = new tools_1.Auth0(this.mgmtClient, this.assets, (0, utils_1.toConfigFn)(this.config));
        logger_1.default.info('Loading Auth0 Tenant Data');
        await auth0.loadAssetsFromAuth0();
        const shouldPreserveKeywords = 
        //@ts-ignore because the string=>boolean conversion may not have happened if passed-in as env var
        this.config.AUTH0_PRESERVE_KEYWORDS === 'true' ||
            this.config.AUTH0_PRESERVE_KEYWORDS === true;
        if (shouldPreserveKeywords) {
            await this.loadAssetsFromLocal({ disableKeywordReplacement: true }); //Need to disable keyword replacement to retrieve the raw keyword markers (ex: ##KEYWORD##)
            const localAssets = { ...this.assets };
            //@ts-ignore
            delete this['assets'];
            this.assets = (0, keywordPreservation_1.preserveKeywords)({
                localAssets,
                remoteAssets: auth0.assets,
                keywordMappings: this.config.AUTH0_KEYWORD_REPLACE_MAPPINGS || {},
                auth0Handlers: auth0.handlers,
            });
        }
        else {
            this.assets = auth0.assets;
        }
        // Clean known read only fields
        this.assets = (0, readonly_1.default)(this.assets, this.config);
        // Copy clients to be used by handlers which require converting client_id to the name
        // Must copy as the client_id will be stripped if AUTH0_EXPORT_IDENTIFIERS is false
        //@ts-ignore because assets haven't been typed yet TODO: type assets
        this.assets.clientsOrig = [...(this.assets.clients || [])];
        // Copy user attribute profiles with their IDs for use by self-service profiles mapping
        this.assets.userAttributeProfilesWithId = [...(this.assets.userAttributeProfiles || [])];
        // Optionally Strip identifiers
        if (!this.config.AUTH0_EXPORT_IDENTIFIERS) {
            this.assets = (0, utils_1.stripIdentifiers)(auth0, this.assets);
        }
        await Promise.all(Object.entries(handlers_1.default)
            .filter(([handlerName]) => {
            const excludedAssetTypes = this.config.AUTH0_EXCLUDED || [];
            return !excludedAssetTypes.includes(handlerName);
        })
            .filter((0, __1.filterOnlyIncludedResourceTypes)(this.config.AUTH0_INCLUDED_ONLY))
            .map(async ([name, handler]) => {
            try {
                await handler.dump(this);
            }
            catch (err) {
                logger_1.default.debug(err.stack);
                throw new Error(`Problem exporting ${name}`);
            }
        }));
    }
}
exports.default = DirectoryContext;
