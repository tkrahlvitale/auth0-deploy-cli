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
exports.shouldExcludeThirdPartyClients = exports.isForbiddenFeatureError = exports.isDeprecatedError = exports.detectInsufficientScopeError = exports.stripObfuscatedFieldsFromPayload = exports.validateNoUnresolvedPlaceholders = exports.obfuscateSensitiveValues = exports.keywordReplaceStringRegExp = exports.keywordReplaceArrayRegExp = void 0;
exports.keywordArrayReplace = keywordArrayReplace;
exports.keywordStringReplace = keywordStringReplace;
exports.keywordReplace = keywordReplace;
exports.wrapArrayReplaceMarkersInQuotes = wrapArrayReplaceMarkersInQuotes;
exports.convertClientNameToId = convertClientNameToId;
exports.convertActionNameToId = convertActionNameToId;
exports.convertActionIdToName = convertActionIdToName;
exports.convertClientNamesToIds = convertClientNamesToIds;
exports.loadFileAndReplaceKeywords = loadFileAndReplaceKeywords;
exports.flatten = flatten;
exports.convertJsonToString = convertJsonToString;
exports.stripFields = stripFields;
exports.getEnabledClients = getEnabledClients;
exports.duplicateItems = duplicateItems;
exports.filterExcluded = filterExcluded;
exports.filterIncluded = filterIncluded;
exports.areArraysEquals = areArraysEquals;
exports.sleep = sleep;
exports.maskSecretAtPath = maskSecretAtPath;
exports.sortGuardianFactors = sortGuardianFactors;
exports.isDryRun = isDryRun;
exports.printCLIMessage = printCLIMessage;
const path_1 = __importDefault(require("path"));
const fs_1 = __importStar(require("fs"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = __importDefault(require("../logger"));
const constants_1 = __importDefault(require("./constants"));
const keywordReplaceArrayRegExp = (key) => {
    const pattern = `@@${key}@@`;
    //YAML format supports both single and double quotes for strings
    const patternWithSingleQuotes = `'${pattern}'`;
    const patternWithDoubleQuotes = `"${pattern}"`;
    return new RegExp(`${patternWithSingleQuotes}|${patternWithDoubleQuotes}|${pattern}`, 'g');
};
exports.keywordReplaceArrayRegExp = keywordReplaceArrayRegExp;
const keywordReplaceStringRegExp = (key) => {
    return new RegExp(`##${key}##`, 'g');
};
exports.keywordReplaceStringRegExp = keywordReplaceStringRegExp;
function keywordArrayReplace(input, mappings) {
    Object.keys(mappings).forEach(function (key) {
        // Matching against two sets of patterns because a developer may provide their array replacement keyword with or without wrapping quotes. It is not obvious to the developer which to do depending if they're operating in YAML or JSON.
        const regex = (0, exports.keywordReplaceArrayRegExp)(key);
        // Use function-based replacement to prevent $ sequences (e.g., $', $`, $&) from being interpreted as special replacement patterns to fixes issue #1153.
        input = input.replace(regex, () => JSON.stringify(mappings[key]));
    });
    return input;
}
function keywordStringReplace(input, mappings) {
    Object.keys(mappings).forEach(function (key) {
        const regex = (0, exports.keywordReplaceStringRegExp)(key);
        // Use function-based replacement to prevent $ sequences (e.g., $', $`, $&) from being interpreted as special replacement patterns to fixes issue #1153.
        // @ts-ignore TODO: come back and distinguish strings vs array replacement.
        input = input.replace(regex, () => mappings[key]);
    });
    return input;
}
function keywordReplace(input, mappings) {
    // Replace keywords with mappings within input.
    if (input === undefined) {
        return 'undefined';
    }
    if (mappings && Object.keys(mappings).length > 0) {
        input = keywordArrayReplace(input, mappings);
        input = keywordStringReplace(input, mappings);
    }
    return input;
}
// wrapArrayReplaceMarkersInQuotes will wrap array replacement markers in quotes.
// This is necessary for YAML format in the context of keyword replacement
// to preserve the keyword markers while also maintaining valid YAML syntax.
function wrapArrayReplaceMarkersInQuotes(body, mappings) {
    let newBody = body;
    Object.keys(mappings).forEach((keyword) => {
        newBody = newBody.replace(new RegExp('(?<![\'"])@@' + keyword + '@@(?![\'"])', 'g'), `"@@${keyword}@@"`);
    });
    return newBody;
}
function convertClientNameToId(name, clients) {
    const found = clients.find((c) => c.name === name);
    return (found && found.client_id) || name;
}
function convertActionNameToId(name, actions) {
    const found = actions.find((a) => a.name === name);
    return (found && found.id) || name;
}
function convertActionIdToName(id, actions) {
    const found = actions.find((a) => a.id === id);
    return (found && found.name) || id;
}
function convertClientNamesToIds(names, clients) {
    const resolvedNames = names.map((name) => ({ name, resolved: false }));
    const result = clients.reduce((acc, client) => {
        if (names.includes(client.name)) {
            const index = resolvedNames.findIndex((item) => item.name === client.name);
            resolvedNames[index].resolved = true;
            return [...acc, client.client_id];
        }
        return [...acc];
    }, []);
    const unresolved = resolvedNames.filter((item) => !item.resolved).map((item) => item.name);
    // @ts-ignore TODO: come back and refactor to use map instead of reduce.
    return [...unresolved, ...result];
}
function loadFileAndReplaceKeywords(file, { mappings, disableKeywordReplacement = false, }) {
    // Load file and replace keyword mappings
    const f = path_1.default.resolve(file);
    try {
        fs_1.default.accessSync(f, fs_1.constants.F_OK);
        if (mappings && !disableKeywordReplacement) {
            return keywordReplace(fs_1.default.readFileSync(f, 'utf8'), mappings);
        }
        return fs_1.default.readFileSync(f, 'utf8');
    }
    catch (error) {
        throw new Error(`Unable to load file ${f} due to ${error}`);
    }
}
function flatten(list) {
    // Flatten an multiple arrays to single array
    return list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
}
function convertJsonToString(obj, spacing = 0) {
    return JSON.stringify(obj, null, spacing);
}
function stripFields(obj, fields) {
    // Strip object fields supporting dot notation (ie: a.deep.field)
    const stripped = [];
    const newObj = { ...obj };
    fields.forEach((f) => {
        if (dot_prop_1.default.get(newObj, f) !== undefined) {
            dot_prop_1.default.delete(newObj, f);
            stripped.push(f);
        }
    });
    if (stripped) {
        const name = ['id', 'client_id', 'template', 'name'].reduce((n, k) => newObj[k] || n, '');
        logger_1.default.debug(`Stripping "${name}" read-only fields ${JSON.stringify(stripped)}`);
    }
    return newObj;
}
function getEnabledClients(assets, connection, existing, clients) {
    // Convert enabled_clients by name to the id
    if (connection.enabled_clients === undefined)
        return undefined; // If no enabled clients passed in, explicitly ignore from management, preventing unintentional disabling of connection.
    const excludedClientsByNames = (assets.exclude && assets.exclude.clients) || [];
    const excludedClients = convertClientNamesToIds(excludedClientsByNames, clients);
    const allExcluded = [...excludedClientsByNames, ...excludedClients];
    const enabledClients = [
        ...convertClientNamesToIds(connection.enabled_clients || [], clients).filter((item) => !allExcluded.includes(item)),
    ];
    // If client is excluded and in the existing connection this client is enabled, it should keep enabled
    // If client is excluded and in the existing connection this client is disabled, it should keep disabled
    existing.forEach((conn) => {
        if (conn.name === connection.name) {
            excludedClients.forEach((excludedClient) => {
                if (conn.enabled_clients?.includes(excludedClient)) {
                    enabledClients.push(excludedClient);
                }
            });
        }
    });
    return enabledClients;
}
function duplicateItems(arr, key) {
    // Find duplicates objects within array that have the same key value
    const duplicates = arr.reduce((accum, obj) => {
        const keyValue = obj[key];
        if (keyValue) {
            if (!(keyValue in accum))
                accum[keyValue] = [];
            accum[keyValue].push(obj);
        }
        return accum;
    }, {});
    return Object.values(duplicates).filter((g) => g.length > 1);
}
function filterExcluded(changes, exclude) {
    const { del, update, create, conflicts } = changes;
    if (!exclude.length) {
        return changes;
    }
    const filter = (list) => list.filter((item) => !exclude.includes(item.name));
    return {
        del: filter(del),
        update: filter(update),
        create: filter(create),
        conflicts: filter(conflicts),
    };
}
function filterIncluded(changes, include) {
    const { del, update, create, conflicts } = changes;
    if (!include || !include.length) {
        return changes;
    }
    const filter = (list) => list.filter((item) => include.includes(item.name));
    return {
        del: filter(del),
        update: filter(update),
        create: filter(create),
        conflicts: filter(conflicts),
    };
}
function areArraysEquals(x, y) {
    return lodash_1.default.isEqual(x && x.sort(), y && y.sort());
}
const obfuscateSensitiveValues = (data, sensitiveFieldsToObfuscate) => {
    if (data === null)
        return data;
    if (Array.isArray(data)) {
        return data.map((asset) => (0, exports.obfuscateSensitiveValues)(asset, sensitiveFieldsToObfuscate));
    }
    const newAsset = { ...data };
    sensitiveFieldsToObfuscate.forEach((sensitiveField) => {
        if (dot_prop_1.default.get(newAsset, sensitiveField) !== undefined) {
            dot_prop_1.default.set(newAsset, sensitiveField, constants_1.default.OBFUSCATED_SECRET_VALUE);
        }
    });
    return newAsset;
};
exports.obfuscateSensitiveValues = obfuscateSensitiveValues;
const UNRESOLVED_PLACEHOLDER_REGEX = /^(##.+##|@@.+@@)$/;
// Recursively collects all fields in an asset that still contain an unresolved
// ##...## (string) or @@...@@ (array) keyword placeholder.
const collectUnresolvedPlaceholders = (data, parentPath = '') => {
    if (data === null || typeof data !== 'object')
        return [];
    const found = [];
    Object.keys(data).forEach((key) => {
        const fullPath = parentPath ? `${parentPath}.${key}` : key;
        const value = data[key];
        if (typeof value === 'string' && UNRESOLVED_PLACEHOLDER_REGEX.test(value)) {
            found.push({ path: fullPath, value });
        }
        else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            found.push(...collectUnresolvedPlaceholders(value, fullPath));
        }
    });
    return found;
};
// Throws an error if any field in the asset contains an unresolved ##...## or @@...@@ placeholder,
// listing all offending fields so the user can fix them before deploying.
const validateNoUnresolvedPlaceholders = (data, resourceType, resourceName) => {
    if (data === null)
        return data;
    const unresolved = collectUnresolvedPlaceholders(data);
    if (unresolved.length > 0) {
        const fields = unresolved.map(({ path, value }) => `  - "${path}": ${value}`).join('\n');
        throw new Error(`Unresolved placeholder(s) found in ${resourceType} "${resourceName}":\n${fields}\nPlease ensure all keyword mappings are defined before deploying.`);
    }
    return data;
};
exports.validateNoUnresolvedPlaceholders = validateNoUnresolvedPlaceholders;
// The reverse of `obfuscateSensitiveValues()`, preventing an obfuscated value from being passed to the API
const stripObfuscatedFieldsFromPayload = (data, obfuscatedFields) => {
    if (data === null)
        return data;
    if (Array.isArray(data)) {
        return data.map((asset) => (0, exports.stripObfuscatedFieldsFromPayload)(asset, obfuscatedFields));
    }
    const newAsset = { ...data };
    obfuscatedFields.forEach((sensitiveField) => {
        const obfuscatedFieldValue = dot_prop_1.default.get(newAsset, sensitiveField);
        if (obfuscatedFieldValue === constants_1.default.OBFUSCATED_SECRET_VALUE) {
            dot_prop_1.default.delete(newAsset, sensitiveField);
        }
    });
    return newAsset;
};
exports.stripObfuscatedFieldsFromPayload = stripObfuscatedFieldsFromPayload;
const detectInsufficientScopeError = async (fn) => {
    try {
        const data = await fn();
        return {
            hadSufficientScopes: true,
            data,
            requiredScopes: [],
        };
    }
    catch (err) {
        if (err.statusCode === 403 && err.message.includes('Insufficient scope')) {
            const requiredScopes = err.message?.split('Insufficient scope, expected any of: ')?.slice(1);
            return {
                hadSufficientScopes: false,
                requiredScopes,
                data: null,
            };
        }
        throw err;
    }
};
exports.detectInsufficientScopeError = detectInsufficientScopeError;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const isDeprecatedError = (err) => {
    if (!err)
        return false;
    return !!(err.statusCode === 403 || err.message?.includes('deprecated feature'));
};
exports.isDeprecatedError = isDeprecatedError;
const isForbiddenFeatureError = (err, type) => {
    if (err.statusCode === 403) {
        logger_1.default.warn(`${err.message};${err.errorCode ?? ''} - Skipping ${type}`);
        return true;
    }
    return false;
};
exports.isForbiddenFeatureError = isForbiddenFeatureError;
// This function masks the secret at the given JSON path in the object with the provided mask value.
function maskSecretAtPath({ resourceTypeName, maskedKeyName, maskOnObj, keyJsonPath, }) {
    // Replace spaces and special characters with underscores
    const sanitize = (str) => str.replace(/[^a-zA-Z0-9]/g, '_');
    if (dot_prop_1.default.has(maskOnObj, keyJsonPath)) {
        const maskValue = `##${sanitize(resourceTypeName)}_${sanitize(maskedKeyName)}_SECRET##`.toUpperCase();
        dot_prop_1.default.set(maskOnObj, keyJsonPath, maskValue);
    }
    return maskOnObj;
}
/**
 * Determines whether third-party clients should be excluded based on configuration.
 * Checks the AUTH0_EXCLUDE_THIRD_PARTY_CLIENTS config value and returns true if it's
 * set to boolean true or string 'true'.
 *
 * @param configFn - The configuration function to retrieve the config value.
 * @returns True if third-party clients should be excluded, false otherwise.
 */
const shouldExcludeThirdPartyClients = (configFn) => {
    const value = configFn('AUTH0_EXCLUDE_THIRD_PARTY_CLIENTS');
    return value === 'true' || value === true;
};
exports.shouldExcludeThirdPartyClients = shouldExcludeThirdPartyClients;
// Sort guardian factors by name
function sortGuardianFactors(factors) {
    // if no factors, return empty array
    if (!factors || factors.length === 0)
        return [];
    return factors.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0;
    });
}
// Check if dry-run flag is enabled
function isDryRun(config) {
    if (typeof config !== 'function')
        return false;
    return config('AUTH0_DRY_RUN') === true || config('AUTH0_DRY_RUN') === 'true';
}
// Print a message to the CLI message console
function printCLIMessage(message) {
    process.stdout.write(message + '\n');
}
