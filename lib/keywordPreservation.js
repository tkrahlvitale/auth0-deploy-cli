"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preserveKeywords = exports.updateAssetsByAddress = exports.convertAddressToDotNotation = exports.getAssetsValueByAddress = exports.getPreservableFieldsFromAssets = exports.doesHaveKeywordMarker = void 0;
const dot_prop_1 = require("dot-prop");
const lodash_1 = require("lodash");
const utils_1 = require("./tools/utils");
const utils_2 = require("./utils");
const logger_1 = __importDefault(require("./logger"));
/*
  RFC for Keyword Preservation: https://github.com/auth0/auth0-deploy-cli/issues/688
  Original Github Issue: https://github.com/auth0/auth0-deploy-cli/issues/328
*/
const doesHaveKeywordMarker = (string, keywordMappings) => {
    if (string === undefined) {
        return false;
    }
    return !Object.keys(keywordMappings).every((keyword) => {
        const hasArrayMarker = (0, utils_1.keywordReplaceArrayRegExp)(keyword).test(string);
        const hasStringMarker = (0, utils_1.keywordReplaceStringRegExp)(keyword).test(string);
        return !hasArrayMarker && !hasStringMarker;
    });
};
exports.doesHaveKeywordMarker = doesHaveKeywordMarker;
const getPreservableFieldsFromAssets = (asset, keywordMappings, resourceSpecificIdentifiers, address = '') => {
    if (typeof asset === 'string') {
        if ((0, exports.doesHaveKeywordMarker)(asset, keywordMappings)) {
            return [address];
        }
        return [];
    }
    const shouldRenderDot = address !== '';
    if (Array.isArray(asset)) {
        return asset
            .map((arrayItem) => {
            const resourceIdentifiers = (() => {
                const identifierOrIdentifiers = resourceSpecificIdentifiers[address];
                if (Array.isArray(identifierOrIdentifiers)) {
                    return identifierOrIdentifiers;
                }
                if (identifierOrIdentifiers === undefined) {
                    return [];
                }
                return [identifierOrIdentifiers];
            })();
            const specificAddress = resourceIdentifiers.reduce((aggregateAddress, resourceIdentifier) => {
                resourceSpecificIdentifiers[address];
                if (resourceIdentifier === undefined)
                    return aggregateAddress; // See if this specific resource type has an identifier
                const identifierFieldValue = arrayItem[resourceIdentifier];
                if (identifierFieldValue === undefined)
                    return aggregateAddress; // See if this specific array item possess the resource-specific identifier
                if (aggregateAddress === '') {
                    return `${resourceIdentifier}=${identifierFieldValue}`;
                }
                return `${aggregateAddress}||${resourceIdentifier}=${identifierFieldValue}`;
            }, '');
            if (specificAddress.length === 0) {
                // No identifiers registered: skip. Identifiers registered but absent from item: fall back to positional index.
                if (resourceIdentifiers.length === 0) {
                    return [];
                }
                const arrayIndex = asset.indexOf(arrayItem);
                return (0, exports.getPreservableFieldsFromAssets)(arrayItem, keywordMappings, resourceSpecificIdentifiers, `${address}${shouldRenderDot ? '.' : ''}${arrayIndex}`);
            }
            return (0, exports.getPreservableFieldsFromAssets)(arrayItem, keywordMappings, resourceSpecificIdentifiers, `${address}${shouldRenderDot ? '.' : ''}[${specificAddress}]`);
        })
            .flat();
    }
    if (typeof asset === 'object') {
        return Object.keys(asset)
            .map((key) => {
            const value = asset[key];
            if (value === undefined || value === null)
                return [];
            return (0, exports.getPreservableFieldsFromAssets)(value, keywordMappings, resourceSpecificIdentifiers, `${address}${shouldRenderDot ? '.' : ''}${key}`);
        })
            .flat();
    }
    return [];
};
exports.getPreservableFieldsFromAssets = getPreservableFieldsFromAssets;
// getAssetsValueByAddress returns a value for an arbitrary data structure when
// provided an "address" of that value. This address is similar to JS object notation
// with the exception of identifying array items by a unique property instead of order.
// Example:
// Object: `{ actions: [ { name: "action-1", code: "..."}] }`
// Address: `.actions[name=action-1].code`
const getAssetsValueByAddress = (address, assets) => {
    // Look ahead and see if the address path only contains dots (ex: `tenant.friendly_name`)
    // if so the address is trivial and can use the dot-prop package to return the value
    const isTrivialAddress = address.indexOf('[') === -1;
    if (isTrivialAddress) {
        return (0, dot_prop_1.get)(assets, address);
    }
    // It is easier to handle an address piece-by-piece by
    // splitting on the period into separate "directions"
    const directions = address.split(/\.(?![^\[]*\])/g);
    // If the the next directions are the proprietary array syntax (ex: `[name=foo]`)
    // then perform lookup against unique array-item property
    if (directions[0].charAt(0) === '[') {
        if (!(0, lodash_1.isArray)(assets))
            return undefined;
        const target = assets.find((item) => {
            const parts = directions[0].substring(1).slice(0, -1).split('||');
            return parts.every((part) => {
                const identifier = part.split('=')[0];
                const identifierValue = part.split('=')[1];
                return item[identifier] === identifierValue;
            });
        });
        return (0, exports.getAssetsValueByAddress)(directions.slice(1).join('.'), target);
    }
    return (0, exports.getAssetsValueByAddress)(directions.slice(1).join('.'), (0, dot_prop_1.get)(assets, directions[0]));
};
exports.getAssetsValueByAddress = getAssetsValueByAddress;
// convertAddressToDotNotation will convert the proprietary address into conventional
// JS object notation. Performing this conversion simplifies the process
// of updating a specific property for a given asset tree using the dot-prop library
// returns null if address value does not exist in asset tree
const convertAddressToDotNotation = (assets, address, finalAddressTrail = '') => {
    if (assets === null)
        return null; // Asset does not exist on remote
    const directions = address.split(/\.(?![^\[]*\])/g);
    if (directions[0] === '')
        return finalAddressTrail;
    if (directions[0].charAt(0) === '[') {
        const identifiers = directions[0].substring(1).slice(0, -1).split('||');
        let targetIndex = -1;
        assets.forEach((item, index) => {
            if (identifiers.every((part) => {
                const identifier = part.split('=')[0];
                const identifierValue = part.split('=')[1];
                return item[identifier] === identifierValue;
            })) {
                targetIndex = index;
            }
        });
        if (targetIndex === -1)
            return null; // No object of this address exists in the assets
        return (0, exports.convertAddressToDotNotation)(assets[targetIndex], directions.slice(1).join('.'), `${finalAddressTrail}.${targetIndex}`);
    }
    return (0, exports.convertAddressToDotNotation)((0, dot_prop_1.get)(assets, directions[0]), directions.slice(1).join('.'), finalAddressTrail === '' ? directions[0] : `${finalAddressTrail}.${directions[0]}`);
};
exports.convertAddressToDotNotation = convertAddressToDotNotation;
const updateAssetsByAddress = (assets, address, newValue) => {
    const dotNotationAddress = (0, exports.convertAddressToDotNotation)(assets, address);
    if (dotNotationAddress === null)
        return assets;
    const doesPropertyExist = (0, dot_prop_1.get)(assets, dotNotationAddress) !== undefined;
    if (!doesPropertyExist) {
        return assets;
    }
    (0, dot_prop_1.set)(assets, dotNotationAddress, newValue);
    return assets;
};
exports.updateAssetsByAddress = updateAssetsByAddress;
// preserveKeywords is the function that ultimately gets executed during export
// to attempt to preserve keywords (ex: ##KEYWORD##) in local configuration files
// from getting overwritten by remote values during export.
const preserveKeywords = ({ localAssets, remoteAssets, keywordMappings, auth0Handlers, }) => {
    if (Object.keys(keywordMappings).length === 0)
        return remoteAssets;
    const resourceSpecificIdentifiers = auth0Handlers.reduce((acc, handler) => {
        acc[handler.type] = handler.identifiers.flat();
        return acc;
    }, {});
    const addresses = (0, exports.getPreservableFieldsFromAssets)(localAssets, keywordMappings, resourceSpecificIdentifiers, '');
    // Convert client_id to client name in clientGrants if clients are available for keyword preservation in clientGrants
    if (remoteAssets && remoteAssets.clientGrants) {
        if (remoteAssets.clients) {
            for (let i = 0; i < remoteAssets.clientGrants.length; i++) {
                const clientGrant = remoteAssets.clientGrants[i];
                clientGrant.client_id = (0, utils_2.convertClientIdToName)(clientGrant.client_id, remoteAssets.clients);
                remoteAssets.clientGrants[i] = clientGrant;
            }
        }
        else {
            logger_1.default.debug("Keyword preservation for 'clientGrants' has dependency on the 'clients' resource, make sure to include both in the export.");
        }
    }
    let updatedRemoteAssets = (0, lodash_1.cloneDeep)(remoteAssets);
    addresses.forEach((address) => {
        const localValue = (0, exports.getAssetsValueByAddress)(address, localAssets);
        const remoteAssetsAddress = (() => {
            const doesAddressHaveKeyword = (0, exports.doesHaveKeywordMarker)(address, keywordMappings);
            if (doesAddressHaveKeyword) {
                return (0, utils_1.keywordReplace)(address, keywordMappings);
            }
            return address;
        })();
        const remoteValue = (0, exports.getAssetsValueByAddress)(remoteAssetsAddress, remoteAssets);
        const localValueWithReplacement = (0, utils_1.keywordReplace)(localValue, keywordMappings);
        const localAndRemoteValuesAreEqual = (() => {
            if (typeof remoteValue === 'string') {
                return localValueWithReplacement === remoteValue;
            }
            // TODO:  Account for non-string replacements via @@ syntax
            return false; // Default to false
        })();
        if (!localAndRemoteValuesAreEqual) {
            // eslint-disable-next-line no-console
            console.warn(`WARNING! The remote value with address of ${address} has value of "${remoteValue}" but will be preserved with "${localValueWithReplacement}" due to keyword preservation.`);
        }
        // Update the clientGrants audience field if it exists
        if (updatedRemoteAssets && updatedRemoteAssets.clientGrants) {
            for (let i = 0; i < updatedRemoteAssets.clientGrants.length; i++) {
                const clientGrant = updatedRemoteAssets.clientGrants[i];
                if (clientGrant.audience === remoteValue) {
                    clientGrant.audience = localValue;
                }
                updatedRemoteAssets.clientGrants[i] = clientGrant;
            }
        }
        // Two address possibilities are provided to account for cases when there is a keyword
        // in the resources's identifier field. When the resource identifier's field is preserved
        // on the remote assets tree, it loses its identify, so we'll need to try two addresses:
        // one where the identifier field has a keyword and one where the identifier field has
        // the literal replaced value.
        // Example: `customDomains.[domain=##DOMAIN].domain` and `customDomains.[domain=travel0.com].domain`
        updatedRemoteAssets = (0, exports.updateAssetsByAddress)(updatedRemoteAssets, address, // Two possible addresses need to be passed, one with identifier field keyword replaced and one where it is not replaced. Ex: `customDomains.[domain=##DOMAIN].domain` and `customDomains.[domain=travel0.com].domain`
        localValue);
        updatedRemoteAssets = (0, exports.updateAssetsByAddress)(updatedRemoteAssets, remoteAssetsAddress, // Two possible addresses need to be passed, one with identifier field keyword replaced and one where it is not replaced. Ex: `customDomains.[domain=##DOMAIN].domain` and `customDomains.[domain=travel0.com].domain`
        localValue);
    });
    return updatedRemoteAssets;
};
exports.preserveKeywords = preserveKeywords;
