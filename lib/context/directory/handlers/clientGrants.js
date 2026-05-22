"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const client_1 = require("../../../tools/auth0/client");
const keywordPreservation_1 = require("../../../keywordPreservation");
function parse(context) {
    const grantsFolder = path_1.default.join(context.filePath, tools_1.constants.CLIENTS_GRANTS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(grantsFolder))
        return { clientGrants: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(grantsFolder, ['.json']);
    const clientGrants = foundFiles
        .map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 0); // Filter out empty grants
    return {
        clientGrants,
    };
}
async function dump(context) {
    let { clientGrants } = context.assets;
    if (!clientGrants)
        return; // Skip, nothing to dump
    const grantsFolder = path_1.default.join(context.filePath, tools_1.constants.CLIENTS_GRANTS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(grantsFolder);
    if (clientGrants.length === 0)
        return;
    const excludedClientsByNames = (context.assets.exclude && context.assets.exclude.clients) || [];
    const allResourceServers = await (0, client_1.paginate)(context.mgmtClient.resourceServers.list, {
        paginate: true,
        include_totals: true,
    });
    const allClients = await (0, client_1.paginate)(context.mgmtClient.clients.list, {
        paginate: true,
        include_totals: true,
    });
    // Filter out grants for excluded clients
    if (excludedClientsByNames.length) {
        const excludedClientIds = new Set(allClients
            .filter((c) => c.name !== undefined && excludedClientsByNames.includes(c.name))
            .map((c) => c.client_id));
        clientGrants = clientGrants.filter((grant) => !excludedClientIds.has(grant.client_id));
    }
    // Convert client_id to the client name for readability
    clientGrants.forEach((grant) => {
        const dumpGrant = { ...grant };
        if (context.assets.clientsOrig) {
            dumpGrant.client_id = (0, utils_1.convertClientIdToName)(dumpGrant.client_id, context.assets.clientsOrig);
        }
        const clientName = (() => {
            const associatedClient = allClients.find((client) => client.client_id === grant.client_id);
            if (associatedClient === undefined)
                return grant.client_id;
            return associatedClient.name;
        })();
        // Convert audience to the API name for readability
        const apiName = (grantAudience) => {
            if (!grantAudience)
                return grantAudience;
            const associatedAPI = allResourceServers.find((resourceServer) => resourceServer.identifier === grantAudience);
            if (associatedAPI === undefined)
                return grantAudience; // Use the audience if the API is not found
            return associatedAPI.name; // Use the name of the API
        };
        // Replace keyword markers if necessary
        const clientNameNonMarker = (0, keywordPreservation_1.doesHaveKeywordMarker)(clientName, context.mappings)
            ? (0, tools_1.keywordReplace)(clientName, context.mappings)
            : clientName;
        const apiAudienceNonMarker = (0, keywordPreservation_1.doesHaveKeywordMarker)(grant.audience, context.mappings)
            ? (0, tools_1.keywordReplace)(grant.audience, context.mappings)
            : grant.audience;
        // Construct the name using non-marker names
        const name = (0, utils_1.sanitize)(`${clientNameNonMarker}-${apiName(apiAudienceNonMarker)}`);
        // Ensure the name is not empty or invalid
        if (!name || name.trim().length === 0) {
            throw new Error(`Invalid name generated for client grant: ${JSON.stringify(grant)}`);
        }
        const grantFile = path_1.default.join(grantsFolder, `${name}.json`);
        (0, utils_1.dumpJSON)(grantFile, dumpGrant);
    });
}
const clientGrantsHandler = {
    parse,
    dump,
};
exports.default = clientGrantsHandler;
