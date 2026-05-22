"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../../../utils");
const logger_1 = __importDefault(require("../../../logger"));
async function parse(context) {
    // Load the script file for custom db
    const { databases } = context.assets;
    if (!databases)
        return { databases: null };
    return {
        databases: [
            ...databases.map((database) => ({
                ...database,
                options: {
                    ...(database.options || {}),
                    // customScripts option only written if there are scripts
                    ...(database.options?.customScripts && {
                        customScripts: Object.entries(database.options.customScripts).reduce((scripts, [name, script]) => ({
                            ...scripts,
                            [name]: context.loadFile(script),
                        }), {}),
                    }),
                },
            })),
        ],
    };
}
async function dump(context) {
    let { databases } = context.assets;
    const { clients } = context.assets;
    if (!databases)
        return { databases: null };
    // Filter excluded databases
    const excludedDatabases = (context.assets.exclude && context.assets.exclude.databases) || [];
    if (excludedDatabases.length) {
        databases = databases.filter((database) => !excludedDatabases.includes(database.name));
    }
    const sortCustomScripts = ([name1], [name2]) => {
        if (name1 === name2)
            return 0;
        return name1 > name2 ? 1 : -1;
    };
    return {
        databases: [
            ...databases.map((database) => ({
                ...database,
                ...(database.enabled_clients && {
                    enabled_clients: (0, utils_1.mapClientID2NameSorted)(database.enabled_clients, clients || []),
                }),
                options: {
                    ...(database.options || {}),
                    // customScripts option only written if there are scripts
                    ...(database.options?.customScripts && {
                        customScripts: Object.entries(database.options.customScripts)
                            //@ts-ignore because we'll fix this in subsequent PR
                            .sort(sortCustomScripts)
                            .reduce((scripts, [name, script]) => {
                            // Create Database folder
                            const dbName = (0, utils_1.sanitize)(database.name);
                            const dbFolder = path_1.default.join(context.basePath, 'databases', (0, utils_1.sanitize)(dbName));
                            fs_extra_1.default.ensureDirSync(dbFolder);
                            // Dump custom script to file
                            const scriptName = (0, utils_1.sanitize)(name);
                            const scriptFile = path_1.default.join(dbFolder, `${scriptName}.js`);
                            logger_1.default.info(`Writing ${scriptFile}`);
                            //@ts-ignore because we'll fix this in subsequent PR
                            fs_extra_1.default.writeFileSync(scriptFile, script);
                            scripts[name] = `./databases/${dbName}/${scriptName}.js`;
                            return scripts;
                        }, {}),
                    }),
                },
            })),
        ],
    };
}
const databasesHandler = {
    parse,
    dump,
};
exports.default = databasesHandler;
