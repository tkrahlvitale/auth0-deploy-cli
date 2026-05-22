import { Management } from 'auth0';
import DefaultAPIHandler from './default';
import { Asset, Assets, CalculatedChanges } from '../../../types';
import { ActionModule } from './actionModules';
export type Action = Management.Action & {
    deployed?: boolean;
};
type ActionCreate = Management.CreateActionRequestContent;
type CreateActionRequestWithId = ActionCreate & {
    id: string;
};
export declare const schema: {
    type: string;
    items: {
        type: string;
        required: string[];
        additionalProperties: boolean;
        properties: {
            code: {
                type: string;
                default: string;
            };
            runtime: {
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
                        registry_url: {
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
                        updated_at: {
                            type: string;
                            format: string;
                        };
                    };
                };
            };
            name: {
                type: string;
                default: string;
            };
            supported_triggers: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            default: string;
                        };
                        version: {
                            type: string;
                        };
                        url: {
                            type: string;
                        };
                    };
                };
            };
            modules: {
                type: string;
                items: {
                    type: string;
                    required: string[];
                    properties: {
                        module_name: {
                            type: string;
                        };
                        module_version_number: {
                            type: string;
                        };
                    };
                };
            };
            deployed: {
                type: string;
            };
            status: {
                type: string;
            };
        };
    };
};
export declare function isMarketplaceAction(action: Action): boolean;
export default class ActionHandler extends DefaultAPIHandler {
    existing: Action[] | null;
    constructor(options: DefaultAPIHandler);
    createAction(action: CreateActionRequestWithId): Promise<Management.CreateActionResponseContent>;
    updateAction(actionId: string, action: Management.UpdateActionRequestContent): Promise<Management.UpdateActionResponseContent>;
    deleteAction(actionId: string): Promise<void | never[]>;
    objString(action: any): string;
    deployActions(actions: any): Promise<void>;
    deployAction(action: any): Promise<void>;
    actionChanges(action: any, found: any): Promise<Asset>;
    getType(): Promise<Asset[] | null>;
    calcChanges(assets: Assets): Promise<CalculatedChanges>;
    dryRunChanges(assets: Assets): Promise<CalculatedChanges>;
    enrichActionWithModuleIds(action: Action, modules: ActionModule[]): Promise<Action>;
    processChanges(assets: Assets): Promise<void>;
}
export {};
