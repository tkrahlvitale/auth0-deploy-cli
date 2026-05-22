"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const path_1 = __importDefault(require("path"));
const tools_1 = require("../../tools");
const client_1 = __importDefault(require("../../tools/auth0/client"));
const logger_1 = __importDefault(require("../../logger"));
const utils_1 = require("../../utils");
const handlers_1 = __importDefault(require("./handlers"));
const readonly_1 = __importDefault(require("../../readonly"));
const __1 = require("..");
const keywordPreservation_1 = require("../../keywordPreservation");
class YAMLContext {
    constructor(config, mgmtClient) {
        this.configFile = config.AUTH0_INPUT_FILE;
        this.config = config;
        this.mappings = config.AUTH0_KEYWORD_REPLACE_MAPPINGS || {};
        this.mgmtClient = (0, client_1.default)(mgmtClient);
        this.disableKeywordReplacement = false;
        //@ts-ignore because the assets property gets filled out throughout
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
        this.basePath = (() => {
            if (!!config.AUTH0_BASE_PATH)
                return config.AUTH0_BASE_PATH;
            //@ts-ignore because this looks to be a bug, but do not want to introduce regression; more investigation needed
            return typeof configFile === 'object' ? process.cwd() : path_1.default.dirname(this.configFile);
        })();
    }
    loadFile(f) {
        let toLoad = path_1.default.join(this.basePath, f);
        if (!(0, utils_1.isFile)(toLoad)) {
            // try load not relative to yaml file
            toLoad = f;
            logger_1.default.warn(`Support for absolute paths and paths outside the config root will be deprecated in a future version to improve the security of the tool. ` +
                `Please update your configuration to use paths relative to the config directory. ` +
                `Current absolute path used: ["${f}"]`);
        }
        return (0, tools_1.loadFileAndReplaceKeywords)(path_1.default.resolve(toLoad), {
            mappings: this.mappings,
            disableKeywordReplacement: this.disableKeywordReplacement,
        });
    }
    async loadAssetsFromLocal(opts = { disableKeywordReplacement: false }) {
        // Allow to send object/json directly
        this.disableKeywordReplacement = opts.disableKeywordReplacement;
        if (typeof this.configFile === 'object') {
            this.assets = this.configFile;
        }
        else {
            try {
                const fPath = path_1.default.resolve(this.configFile);
                logger_1.default.debug(`Loading YAML from ${fPath}`);
                Object.assign(this.assets, js_yaml_1.default.load(opts.disableKeywordReplacement
                    ? (0, tools_1.wrapArrayReplaceMarkersInQuotes)(fs_extra_1.default.readFileSync(fPath, 'utf8'), this.mappings)
                    : (0, tools_1.keywordReplace)(fs_extra_1.default.readFileSync(fPath, 'utf8'), this.mappings)) || {});
            }
            catch (err) {
                logger_1.default.debug(err.stack);
                throw new Error(`Problem loading ${this.configFile}\n${err}`);
            }
        }
        this.assets = Object.keys(this.assets).reduce((acc, key) => {
            const excludedAssetTypes = this.config.AUTH0_EXCLUDED || [];
            if (excludedAssetTypes.includes(key))
                return acc;
            return {
                ...acc,
                [key]: this.assets[key],
            };
        }, {});
        const initialAssets = {
            exclude: this.assets.exclude, // Keep the exclude rules in result assets
            include: this.assets.include, // Keep the include rules in result assets
        };
        this.assets = Object.keys(this.assets).reduce((acc, key) => {
            // Get the list of asset types to include
            const includedAssetTypes = this.config.AUTH0_INCLUDED_ONLY;
            // If includedAssetTypes is defined and this asset type (key) is not in the list, exclude it
            if (includedAssetTypes !== undefined && !includedAssetTypes.includes(key))
                return acc;
            // Otherwise, include the asset type in the result
            return {
                ...acc,
                [key]: this.assets[key],
            };
        }, initialAssets);
        // Run initial schema check to ensure valid YAML
        const auth0 = new tools_1.Auth0(this.mgmtClient, this.assets, (0, utils_1.toConfigFn)(this.config));
        if (!opts.disableKeywordReplacement) {
            // The schema validation needs to be disabled during keyword-preserved export because a field may be enforced as an array but will be expressed with an array replace marker (string).
            await auth0.validate();
        }
        // Allow handlers to process the assets such as loading files etc
        await Promise.all(Object.entries(handlers_1.default).map(async ([name, handler]) => {
            try {
                const parsed = await handler.parse(this);
                Object.entries(parsed).forEach(([k, v]) => {
                    this.assets[k] = v;
                });
            }
            catch (err) {
                logger_1.default.debug(err.stack);
                throw new Error(`Problem deploying ${name}, ${err}`);
            }
        }));
    }
    async dump() {
        const auth0 = new tools_1.Auth0(this.mgmtClient, this.assets, (0, utils_1.toConfigFn)(this.config));
        logger_1.default.info('Loading Auth0 Tenant Data');
        try {
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
        }
        catch (err) {
            const docUrl = 'https://auth0.com/docs/deploy/deploy-cli-tool/create-and-configure-the-deploy-cli-application#modify-deploy-cli-application-scopes';
            const extraMessage = err.message.startsWith('Insufficient scope')
                ? `\nSee ${docUrl} for more information`
                : '';
            throw new Error(`Problem loading tenant data from Auth0 ${err}${extraMessage}`);
        }
        await Promise.all(Object.entries(handlers_1.default)
            .filter(([handlerName]) => {
            const excludedAssetTypes = this.config.AUTH0_EXCLUDED || [];
            return !excludedAssetTypes.includes(handlerName);
        })
            .filter((0, __1.filterOnlyIncludedResourceTypes)(this.config.AUTH0_INCLUDED_ONLY))
            .map(async ([name, handler]) => {
            try {
                const data = await handler.dump(this);
                if (data) {
                    if (data[name] !== null)
                        logger_1.default.info(`Exporting ${name}`);
                    Object.entries(data).forEach(([k, v]) => {
                        this.assets[k] = Array.isArray(v)
                            ? v.map(utils_1.formatResults).sort(utils_1.recordsSorter)
                            : (0, utils_1.formatResults)(v);
                    });
                }
            }
            catch (err) {
                logger_1.default.debug(err.stack);
                throw new Error(`Problem exporting ${name}`);
            }
        }));
        // Clean known read only fields
        let cleaned = (0, readonly_1.default)(this.assets, this.config);
        // Delete exclude as it's not part of the auth0 tenant config
        delete cleaned.exclude;
        delete cleaned.include;
        // Optionally Strip identifiers
        if (!this.config.AUTH0_EXPORT_IDENTIFIERS) {
            cleaned = (0, utils_1.stripIdentifiers)(auth0, cleaned);
        }
        // Write YAML File
        const exportOrdered = Boolean(this.config.AUTH0_EXPORT_ORDERED);
        const raw = js_yaml_1.default.dump(cleaned, { sortKeys: exportOrdered });
        logger_1.default.info(`Writing ${this.configFile}`);
        fs_extra_1.default.writeFileSync(this.configFile, raw);
    }
}
exports.default = YAMLContext;
