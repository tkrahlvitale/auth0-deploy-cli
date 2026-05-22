"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
function getDatabase(folder, configRoot, mappingOpts) {
    const metaFile = path_1.default.join(folder, 'database.json');
    const metaData = (() => {
        try {
            return (0, utils_1.loadJSON)(metaFile, mappingOpts);
        }
        catch (err) {
            logger_1.default.warn(`Skipping database folder ${folder} as cannot find or read ${metaFile}`);
            return {};
        }
    })();
    if (!metaData) {
        logger_1.default.warn(`Skipping database folder ${folder} as ${metaFile} is empty`);
        return {};
    }
    const database = {
        ...metaData,
        options: {
            // @ts-ignore because this code exists currently, but still needs to be understood if it is correct or not
            ...(metaData.options || {}),
            // @ts-ignore because this code exists currently, but still needs to be understood if it is correct or not
            ...(metaData?.customScripts && { customScripts: metaData?.customScripts }),
        },
    };
    // If any customScripts configured then load content of files
    if (database.options?.customScripts) {
        Object.entries(database.options.customScripts).forEach(([name, script]) => {
            if (!tools_1.constants.DATABASE_SCRIPTS.includes(name)) {
                // skip invalid keys in customScripts object
                logger_1.default.warn('Skipping invalid database configuration: ' + name);
            }
            else {
                const resolvedBase = path_1.default.resolve(configRoot);
                const toLoad = path_1.default.resolve(folder, script);
                if (!toLoad.startsWith(resolvedBase + path_1.default.sep)) {
                    logger_1.default.warn(`Support for absolute paths and paths outside the config root will be deprecated in a future version to improve the security of the tool. ` +
                        `Please update your configuration to use paths relative to the config directory. ` +
                        `Current absolute path used: ["${script}"]`);
                }
                database.options.customScripts[name] = (0, tools_1.loadFileAndReplaceKeywords)(toLoad, mappingOpts);
            }
        });
    }
    return database;
}
function parse(context) {
    const databaseFolder = path_1.default.join(context.filePath, tools_1.constants.DATABASE_CONNECTIONS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(databaseFolder))
        return { databases: null }; // Skip
    const folders = fs_extra_1.default
        .readdirSync(databaseFolder)
        .map((f) => path_1.default.join(databaseFolder, f))
        .filter((f) => (0, utils_1.isDirectory)(f));
    const databases = folders
        .map((f) => getDatabase(f, context.filePath, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 1);
    return {
        databases,
    };
}
async function dump(context) {
    let { databases } = context.assets;
    if (!databases)
        return; // Skip, nothing to dump
    // Filter excluded databases
    const excludedDatabases = (context.assets.exclude && context.assets.exclude.databases) || [];
    if (excludedDatabases.length) {
        databases = databases.filter((database) => !excludedDatabases.includes(database.name));
    }
    const databasesFolder = path_1.default.join(context.filePath, tools_1.constants.DATABASE_CONNECTIONS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(databasesFolder);
    databases.forEach((database) => {
        const dbFolder = path_1.default.join(databasesFolder, (0, utils_1.sanitize)(database.name));
        fs_extra_1.default.ensureDirSync(dbFolder);
        const sortCustomScripts = (name1, name2) => {
            if (name1 === name2)
                return 0;
            return name1 > name2 ? 1 : -1;
        };
        const formatted = {
            ...database,
            ...(database.enabled_clients && {
                enabled_clients: (0, utils_1.mapClientID2NameSorted)(database.enabled_clients, context.assets.clientsOrig || []),
            }),
            options: {
                ...(database.options || {}),
                // customScripts option only written if there are scripts
                ...(database.options?.customScripts && {
                    customScripts: Object.entries(database.options.customScripts)
                        // @ts-ignore because we'll fix this in subsequent PR
                        .sort(sortCustomScripts)
                        .reduce((scripts, [name, script]) => {
                        // Dump custom script to file
                        const scriptName = (0, utils_1.sanitize)(`${name}.js`);
                        const scriptFile = path_1.default.join(dbFolder, scriptName);
                        logger_1.default.info(`Writing ${scriptFile}`);
                        // @ts-ignore because we'll fix this in subsequent PR
                        fs_extra_1.default.writeFileSync(scriptFile, script);
                        scripts[name] = `./${scriptName}`;
                        return scripts;
                    }, {}),
                }),
            },
        };
        const databaseFile = path_1.default.join(dbFolder, 'database.json');
        (0, utils_1.dumpJSON)(databaseFile, formatted);
    });
}
const databasesHandler = {
    parse,
    dump,
};
exports.default = databasesHandler;
