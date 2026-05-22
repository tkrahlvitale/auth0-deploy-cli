"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = __importDefault(require("../../../logger"));
async function parse(context) {
    // Load the HTML file for each page
    const { emailTemplates } = context.assets;
    if (!emailTemplates)
        return { emailTemplates: null };
    return {
        emailTemplates: [
            ...emailTemplates.map((et) => ({
                ...et,
                body: context.loadFile(et.body),
            })),
        ],
    };
}
async function dump(context) {
    let { emailTemplates } = context.assets;
    if (!emailTemplates) {
        return { emailTemplates: null };
    }
    // Create Templates folder
    const templatesFolder = path_1.default.join(context.basePath, 'emailTemplates');
    fs_extra_1.default.ensureDirSync(templatesFolder);
    emailTemplates = emailTemplates.map((template) => {
        // Dump template to file
        const templateFile = path_1.default.join(templatesFolder, `${template.template}.html`);
        logger_1.default.info(`Writing ${templateFile}`);
        fs_extra_1.default.writeFileSync(templateFile, template.body);
        return { ...template, body: `./emailTemplates/${template.template}.html` };
    });
    return { emailTemplates };
}
const emailTemplatesHandler = {
    parse,
    dump,
};
exports.default = emailTemplatesHandler;
