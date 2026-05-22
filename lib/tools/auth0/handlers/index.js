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
Object.defineProperty(exports, "__esModule", { value: true });
const rules = __importStar(require("./rules"));
const rulesConfigs = __importStar(require("./rulesConfigs"));
const hooks = __importStar(require("./hooks"));
const pages = __importStar(require("./pages"));
const resourceServers = __importStar(require("./resourceServers"));
const databases = __importStar(require("./databases"));
const connections = __importStar(require("./connections"));
const clients = __importStar(require("./clients"));
const tenant = __importStar(require("./tenant"));
const emailProvider = __importStar(require("./emailProvider"));
const emailTemplates = __importStar(require("./emailTemplates"));
const clientGrants = __importStar(require("./clientGrants"));
const guardianFactors = __importStar(require("./guardianFactors"));
const guardianFactorProviders = __importStar(require("./guardianFactorProviders"));
const guardianFactorTemplates = __importStar(require("./guardianFactorTemplates"));
const guardianPolicies = __importStar(require("./guardianPolicies"));
const guardianPhoneFactorSelectedProvider = __importStar(require("./guardianPhoneFactorSelectedProvider"));
const guardianPhoneFactorMessageTypes = __importStar(require("./guardianPhoneFactorMessageTypes"));
const roles = __importStar(require("./roles"));
const branding = __importStar(require("./branding"));
const phoneProviders = __importStar(require("./phoneProvider"));
const phoneTemplates = __importStar(require("./phoneTemplates"));
const prompts = __importStar(require("./prompts"));
const actions = __importStar(require("./actions"));
const actionModules = __importStar(require("./actionModules"));
const triggers = __importStar(require("./triggers"));
const organizations = __importStar(require("./organizations"));
const attackProtection = __importStar(require("./attackProtection"));
const riskAssessment = __importStar(require("./riskAssessment"));
const logStreams = __importStar(require("./logStreams"));
const customDomains = __importStar(require("./customDomains"));
const themes = __importStar(require("./themes"));
const forms = __importStar(require("./forms"));
const flows = __importStar(require("./flows"));
const flowVaultConnections = __importStar(require("./flowVaultConnections"));
const selfServiceProfiles = __importStar(require("./selfServiceProfiles"));
const networkACLs = __importStar(require("./networkACLs"));
const userAttributeProfiles = __importStar(require("./userAttributeProfiles"));
const connectionProfiles = __importStar(require("./connectionProfiles"));
const tokenExchangeProfiles = __importStar(require("./tokenExchangeProfiles"));
const supplementalSignals = __importStar(require("./supplementalSignals"));
const auth0ApiHandlers = {
    rules,
    rulesConfigs,
    hooks,
    pages,
    resourceServers,
    clients,
    databases,
    connections,
    tenant,
    emailProvider,
    emailTemplates,
    clientGrants,
    guardianFactors,
    guardianFactorProviders,
    guardianFactorTemplates,
    guardianPolicies,
    guardianPhoneFactorSelectedProvider,
    guardianPhoneFactorMessageTypes,
    roles,
    branding,
    phoneProviders,
    phoneTemplates,
    //@ts-ignore because prompts have not been universally implemented yet
    prompts,
    actions,
    actionModules,
    triggers,
    organizations,
    attackProtection,
    riskAssessment,
    logStreams,
    customDomains,
    themes,
    forms,
    flows,
    flowVaultConnections,
    selfServiceProfiles,
    networkACLs,
    userAttributeProfiles,
    connectionProfiles,
    tokenExchangeProfiles,
    supplementalSignals,
};
exports.default = auth0ApiHandlers; // TODO: apply stronger types to schema properties
