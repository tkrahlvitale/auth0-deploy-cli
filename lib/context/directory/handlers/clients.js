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
function parse(context) {
    const clientsFolder = path_1.default.join(context.filePath, tools_1.constants.CLIENTS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(clientsFolder))
        return { clients: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(clientsFolder, ['.json']);
    const clients = foundFiles
        .map((f) => {
        const client = (0, utils_1.loadJSON)(f, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
        if (client.custom_login_page) {
            const htmlFileName = path_1.default.join(clientsFolder, client.custom_login_page);
            if ((0, utils_1.isFile)(htmlFileName)) {
                client.custom_login_page = (0, tools_1.loadFileAndReplaceKeywords)(htmlFileName, {
                    mappings: context.mappings,
                    disableKeywordReplacement: context.disableKeywordReplacement,
                });
            }
        }
        return client;
    })
        .filter((p) => Object.keys(p).length > 0); // Filter out empty clients
    return {
        clients,
    };
}
async function dump(context) {
    let { clients } = context.assets;
    const { userAttributeProfiles, connectionProfiles } = context.assets;
    if (!clients)
        return; // Skip, nothing to dump
    // Filter excluded clients
    const excludedClients = (context.assets.exclude && context.assets.exclude.clients) || [];
    if (excludedClients.length) {
        clients = clients.filter((client) => !excludedClients.includes(client.name ?? ''));
    }
    const clientsFolder = path_1.default.join(context.filePath, tools_1.constants.CLIENTS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(clientsFolder);
    clients.forEach((client) => {
        const clientName = (0, utils_1.sanitize)(client.name);
        const clientFile = path_1.default.join(clientsFolder, `${clientName}.json`);
        if (client.custom_login_page) {
            const html = client.custom_login_page;
            const customLoginHtml = path_1.default.join(clientsFolder, `${clientName}_custom_login_page.html`);
            logger_1.default.info(`Writing ${customLoginHtml}`);
            fs_extra_1.default.writeFileSync(customLoginHtml, html);
            client.custom_login_page = `./${clientName}_custom_login_page.html`;
        }
        if (client.express_configuration) {
            // map ids to names for user attribute profiles
            const userAttributeProfileId = client?.express_configuration?.user_attribute_profile_id;
            if (client.express_configuration && userAttributeProfileId) {
                const p = userAttributeProfiles?.find((uap) => uap.id === userAttributeProfileId);
                client.express_configuration.user_attribute_profile_id = p?.name || userAttributeProfileId;
            }
            // map ids to names for connection profiles
            const connectionProfilesProfileId = client?.express_configuration?.connection_profile_id;
            if (client.express_configuration && connectionProfilesProfileId) {
                const c = connectionProfiles?.find((uap) => uap.id === connectionProfilesProfileId);
                client.express_configuration.connection_profile_id = c?.name || connectionProfilesProfileId;
            }
            // map ids to names for okta oin clients
            const oktaOinClientId = client?.express_configuration?.okta_oin_client_id;
            if (client.express_configuration && oktaOinClientId) {
                const o = clients?.find((uap) => uap.client_id === oktaOinClientId);
                client.express_configuration.okta_oin_client_id = o?.name || oktaOinClientId;
            }
        }
        if (client.my_organization_configuration) {
            const myOrganizationUserAttributeProfileId = client.my_organization_configuration.user_attribute_profile_id;
            if (myOrganizationUserAttributeProfileId) {
                const p = userAttributeProfiles?.find((uap) => uap.id === myOrganizationUserAttributeProfileId);
                client.my_organization_configuration.user_attribute_profile_id =
                    p?.name || myOrganizationUserAttributeProfileId;
            }
            const myOrganizationConnectionProfileId = client.my_organization_configuration.connection_profile_id;
            if (myOrganizationConnectionProfileId) {
                const c = connectionProfiles?.find((cp) => cp.id === myOrganizationConnectionProfileId);
                client.my_organization_configuration.connection_profile_id =
                    c?.name || myOrganizationConnectionProfileId;
            }
        }
        if (client.app_type === 'express_configuration') {
            // only keep relevant fields for express configuration
            client = {
                name: client.name,
                app_type: client.app_type,
                client_authentication_methods: client.client_authentication_methods,
                organization_require_behavior: client.organization_require_behavior,
            };
        }
        (0, utils_1.dumpJSON)(clientFile, (0, utils_1.clearClientArrays)(client));
    });
}
const clientsHandler = {
    parse,
    dump,
};
exports.default = clientsHandler;
