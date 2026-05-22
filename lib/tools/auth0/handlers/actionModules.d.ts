import DefaultAPIHandler from './default';
import { Asset, Assets } from '../../../types';
import { Management } from 'auth0';
export declare const schema: {
    type: string;
    items: {
        type: string;
        required: string[];
        additionalProperties: boolean;
        properties: {
            name: {
                type: string;
            };
            code: {
                type: string;
            };
            dependencies: {
                type: string;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {
                        name: {
                            type: string;
                        };
                        version: {
                            type: string;
                        };
                    };
                };
            };
            secrets: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        name: {
                            type: string;
                        };
                        value: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
            all_changes_published: {
                type: string;
            };
        };
    };
};
export type ActionModule = Management.ActionModuleListItem;
export default class ActionModulesHandler extends DefaultAPIHandler {
    existing: ActionModule[] | null;
    constructor(options: DefaultAPIHandler);
    createModule(module: Management.CreateActionModuleRequestContent): Promise<Management.CreateActionModuleResponseContent>;
    updateModule(moduleId: string, module: Management.UpdateActionModuleRequestContent): Promise<Management.UpdateActionModuleResponseContent>;
    deleteModule(moduleId: string): Promise<void>;
    objString(module: ActionModule): string;
    publishActionModules(modules: ActionModule[]): Promise<void>;
    getType(): Promise<Asset[] | null>;
    processChanges(assets: Assets): Promise<void>;
}
