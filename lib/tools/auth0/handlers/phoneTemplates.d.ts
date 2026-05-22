import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets, CalculatedChanges } from '../../../types';
export type PhoneTemplate = Management.PhoneTemplate;
export declare const schema: {
    type: string;
    description: string;
    items: {
        type: string;
        properties: {
            type: {
                type: string;
                description: string;
                enum: string[];
            };
            disabled: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
                properties: {
                    syntax: {
                        type: string;
                        description: string;
                    };
                    from: {
                        type: string;
                        description: string;
                    };
                    body: {
                        type: string;
                        description: string;
                        properties: {
                            text: {
                                type: string;
                                description: string;
                            };
                            voice: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                };
            };
        };
    };
};
export default class PhoneTemplatesHandler extends DefaultHandler {
    existing: PhoneTemplate[];
    constructor(options: DefaultHandler);
    objString(template: any): string;
    getType(): Promise<PhoneTemplate[]>;
    processChanges(assets: Assets): Promise<void>;
    createPhoneTemplate(template: any): Promise<Asset>;
    createPhoneTemplates(creates: CalculatedChanges['create']): Promise<void>;
    updatePhoneTemplate(template: any): Promise<Asset>;
    updatePhoneTemplates(updates: CalculatedChanges['update']): Promise<void>;
    deletePhoneTemplate(template: any): Promise<void>;
    deletePhoneTemplates(data: Asset[]): Promise<void>;
}
