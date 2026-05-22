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
    const { pages } = context.assets;
    if (!pages)
        return { pages: null };
    return {
        pages: [
            ...pages.map((page) => ({
                ...page,
                html: page.html ? context.loadFile(page.html) : '',
            })),
        ],
    };
}
async function dump(context) {
    let pages = context.assets.pages;
    if (!pages) {
        return { pages: null };
    }
    const pagesFolder = path_1.default.join(context.basePath, 'pages');
    fs_extra_1.default.ensureDirSync(pagesFolder);
    pages = pages.map((page) => {
        if (page.html === undefined) {
            return page;
        }
        const htmlFile = path_1.default.join(pagesFolder, `${page.name}.html`);
        logger_1.default.info(`Writing ${htmlFile}`);
        fs_extra_1.default.writeFileSync(htmlFile, page.html);
        return {
            ...page,
            html: `./pages/${page.name}.html`,
        };
    });
    return { pages };
}
const pagesHandler = {
    parse,
    dump,
};
exports.default = pagesHandler;
