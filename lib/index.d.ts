#!/usr/bin/env node
import tools from './tools';
import importCMD from './commands/import';
import exportCMD from './commands/export';
declare const cliCommands: {
    deploy: typeof importCMD;
    dump: typeof exportCMD;
    import: typeof importCMD;
    export: typeof exportCMD;
    tools: typeof tools;
};
export default cliCommands;
export declare const dump: typeof exportCMD;
export declare const deploy: typeof importCMD;
