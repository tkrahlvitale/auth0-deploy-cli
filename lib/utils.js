"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedOptions = exports.decodeBase64ToCertString = exports.encodeCertStringToBase64 = exports.findKeyPathWithValue = void 0;
exports.isTruthy = isTruthy;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.getFiles = getFiles;
exports.loadJSON = loadJSON;
exports.dumpJSON = dumpJSON;
exports.existsMustBeDir = existsMustBeDir;
exports.toConfigFn = toConfigFn;
exports.stripIdentifiers = stripIdentifiers;
exports.sanitize = sanitize;
exports.formatResults = formatResults;
exports.recordsSorter = recordsSorter;
exports.clearTenantFlags = clearTenantFlags;
exports.ensureProp = ensureProp;
exports.clearClientArrays = clearClientArrays;
exports.convertClientIdToName = convertClientIdToName;
exports.hasKeywordMarkers = hasKeywordMarkers;
exports.mapClientID2NameSorted = mapClientID2NameSorted;
exports.nomalizedYAMLPath = nomalizedYAMLPath;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const nconf_1 = __importDefault(require("nconf"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const lodash_1 = require("lodash");
const tools_1 = require("./tools");
const logger_1 = __importDefault(require("./logger"));
function isTruthy(value) {
    return value === true || value === 'true';
}
function isDirectory(filePath) {
    try {
        return fs_extra_1.default.statSync(path_1.default.resolve(filePath)).isDirectory();
    }
    catch (err) {
        return false;
    }
}
function isFile(filePath) {
    try {
        return fs_extra_1.default.statSync(path_1.default.resolve(filePath)).isFile();
    }
    catch (err) {
        return false;
    }
}
function getFiles(folder, exts) {
    if (isDirectory(folder)) {
        return fs_extra_1.default
            .readdirSync(folder)
            .map((f) => path_1.default.join(folder, f))
            .filter((f) => isFile(f) && exts.includes(path_1.default.extname(f)));
    }
    return [];
}
function loadJSON(file, opts = {
    disableKeywordReplacement: false,
    mappings: {},
}) {
    try {
        const content = (0, tools_1.loadFileAndReplaceKeywords)(file, {
            mappings: opts.mappings,
            disableKeywordReplacement: opts.disableKeywordReplacement,
        });
        return JSON.parse(content);
    }
    catch (e) {
        throw new Error(`Error parsing JSON from metadata file: ${file}, because: ${e.message}`);
    }
}
function orderedKeysReplacer(_key, value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const obj = value;
        return Object.fromEntries(Object.keys(obj)
            .sort()
            .map((k) => [k, obj[k]]));
    }
    return value;
}
function dumpJSON(file, mappings) {
    try {
        logger_1.default.info(`Writing ${file}`);
        const exportOrdered = Boolean(nconf_1.default.get('AUTH0_EXPORT_ORDERED'));
        const replacer = exportOrdered ? orderedKeysReplacer : undefined;
        const jsonBody = JSON.stringify(mappings, replacer, 2);
        fs_extra_1.default.writeFileSync(file, jsonBody.endsWith('\n') ? jsonBody : `${jsonBody}\n`);
    }
    catch (e) {
        throw new Error(`Error writing JSON to metadata file: ${file}, because: ${e.message}`);
    }
}
function existsMustBeDir(folder) {
    if (fs_extra_1.default.existsSync(folder)) {
        if (!isDirectory(folder)) {
            throw new Error(`Expected ${folder} to be a folder but got a file?`);
        }
        return true;
    }
    return false;
}
function toConfigFn(data) {
    return (key) => data[key];
}
function stripIdentifiers(auth0, assets) {
    const updated = { ...assets };
    // Some of the object identifiers are required to perform updates.
    // Don't strip these object id's
    const ignore = [
        'actions',
        'rulesConfigs',
        'emailTemplates',
        'guardianFactors',
        'guardianFactorProviders',
        'guardianFactorTemplates',
    ];
    // Optionally Strip identifiers
    auth0.handlers.forEach((h) => {
        if (ignore.includes(h.type))
            return;
        const exist = updated[h.type];
        // All objects with the identifier field is an array. This could change in future.
        if (Array.isArray(exist)) {
            updated[h.type] = exist.map((o) => {
                const newObj = { ...o };
                delete newObj[h.id];
                return newObj;
            });
        }
    });
    return updated;
}
function sanitize(str) {
    if (!str)
        return 'undefined';
    return (0, sanitize_filename_1.default)(str, { replacement: '-' });
}
function formatResults(item) {
    if (!item || typeof item !== 'object') {
        return item;
    }
    const importantFields = {
        name: null,
        client_id: null,
        audience: null,
        template: null,
        identifier: null,
        strategy: null,
        script: null,
        stage: null,
        id: null,
    };
    const result = { ...importantFields };
    Object.entries(item)
        .sort()
        .forEach(([key, value]) => {
        result[key] = value;
    });
    Object.keys(importantFields).forEach((key) => {
        if (result[key] === null)
            delete result[key];
    });
    return result;
}
function recordsSorter(a, b) {
    const importantFields = ['name', 'key', 'client_id', 'template'];
    for (let i = 0; i < importantFields.length; i += 1) {
        const key = importantFields[i];
        if (a[key] && b[key]) {
            return a[key] > b[key] ? 1 : -1;
        }
    }
    return 0;
}
function clearTenantFlags(tenant) {
    if (tenant.flags && !Object.keys(tenant.flags).length) {
        delete tenant.flags;
    }
}
function ensureProp(obj, props) {
    const value = '';
    if (!dot_prop_1.default.has(obj, props)) {
        dot_prop_1.default.set(obj, props, value);
    }
}
function clearClientArrays(client) {
    const propsToClear = ['allowed_clients', 'allowed_logout_urls', 'allowed_origins', 'callbacks'];
    //If designated properties are null, set them as empty arrays instead
    Object.keys(client).forEach((prop) => {
        if (propsToClear.indexOf(prop) >= 0 && !client[prop]) {
            //TODO: understand why setting as empty array instead of deleting null prop. Ex: `delete client[prop]`
            client[prop] = [];
        }
    });
    return client;
}
function convertClientIdToName(clientId, knownClients = []) {
    if (!clientId)
        return 'undefined_clientId';
    try {
        const found = knownClients.find((c) => c.client_id === clientId);
        return (found && found.name) || clientId;
    }
    catch (e) {
        return clientId;
    }
}
function hasKeywordMarkers(value) {
    if (typeof value !== 'string')
        return false;
    return /@@[A-Z_]+@@/.test(value) || /##[A-Z_]+##/.test(value);
}
function mapClientID2NameSorted(enabledClients, knownClients) {
    // If enabledClients is a string (likely contains keyword markers), return as-is
    if (typeof enabledClients === 'string') {
        return enabledClients;
    }
    // If enabledClients is null or undefined, return empty array
    if (!enabledClients) {
        return [];
    }
    // Process each element: preserve keyword markers, convert client IDs to names
    const processedClients = enabledClients.map((client) => {
        if (hasKeywordMarkers(client)) {
            return client;
        }
        return convertClientIdToName(client, knownClients);
    });
    return processedClients.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}
function nomalizedYAMLPath(filePath) {
    // Trim any leading or trailing whitespace
    filePath = filePath.trim();
    // Handle empty path cases
    if (filePath === '') {
        return [];
    }
    // Normalize the path by replacing backslashes with forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    // Split the path using the forward slash as the separator
    let pathSplit = normalizedPath.split('/');
    // Remove empty components resulting from leading or redundant slashes
    pathSplit = pathSplit.filter((component) => component !== '');
    // Remove the first '.' if it's the first component
    if (pathSplit.length > 0 && pathSplit[0] === '.') {
        pathSplit.shift();
    }
    return pathSplit;
}
const findKeyPathWithValue = (obj, findKey, parentPath = '') => {
    // Results array to hold found instances of 'findKey'
    const results = [];
    // Exit early if the object is not an object (edge case for null or primitive values)
    if (!(0, lodash_1.isObject)(obj))
        return results;
    // Iterate over all keys in the object
    (0, lodash_1.forOwn)(obj, (value, key) => {
        // Construct the full path for the current key
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        // If the key matches 'findKey', add its path and value to the results
        if (key === findKey) {
            results.push({ path: currentPath, value });
        }
        // If the value is an object (not null), recurse deeper into it
        if ((0, lodash_1.isObject)(value)) {
            // Recurse and accumulate results
            results.push(...(0, exports.findKeyPathWithValue)(value, findKey, currentPath));
        }
    });
    return results;
};
exports.findKeyPathWithValue = findKeyPathWithValue;
/**
 * Encodes a certificate string to Base64 format if it starts with '-----BEGIN CERTIFICATE-----'.
 *
 * @param cert - The certificate string to be encoded.
 * @returns The Base64 encoded certificate string if the input starts with '-----BEGIN CERTIFICATE-----', otherwise returns the original string.
 */
const encodeCertStringToBase64 = (cert) => {
    if (cert?.startsWith('-----BEGIN CERTIFICATE-----')) {
        return Buffer.from(cert).toString('base64');
    }
    return cert;
};
exports.encodeCertStringToBase64 = encodeCertStringToBase64;
// Decode a Base64 encoded certificate string back to its original format.
const decodeBase64ToCertString = (base64Cert) => {
    try {
        return Buffer.from(base64Cert, 'base64').toString('utf-8');
    }
    catch (e) {
        return base64Cert;
    }
};
exports.decodeBase64ToCertString = decodeBase64ToCertString;
// Format connection options by converting client IDs to client names for SAML connections
const getFormattedOptions = (connection, clients) => {
    try {
        return {
            options: {
                ...connection.options,
                idpinitiated: {
                    ...connection.options.idpinitiated,
                    client_id: convertClientIdToName(connection.options.idpinitiated.client_id, clients),
                },
            },
        };
    }
    catch (e) {
        return {};
    }
};
exports.getFormattedOptions = getFormattedOptions;
