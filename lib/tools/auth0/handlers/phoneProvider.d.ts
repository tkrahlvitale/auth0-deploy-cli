import { Management } from 'auth0';
import DefaultHandler from './default';
import { Assets } from '../../../types';
export declare const schema: {
    type: string;
    description: string;
    items: {
        type: string;
        properties: {
            id: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            name: {
                type: string;
                description: string;
                enum: string[];
                minLength: number;
                maxLength: number;
            };
            disabled: {
                type: string;
                description: string;
                defaultValue: boolean;
            };
            configuration: {
                type: string;
                anyOf: {
                    type: string;
                    additionalProperties: boolean;
                    required: string[];
                    properties: {
                        delivery_methods: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                            minItems: number;
                            uniqueItems: boolean;
                        };
                    };
                }[];
            };
            credentials: {
                description: string;
                anyOf: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {};
                }[];
            };
        };
        additionalProperties: boolean;
    };
};
export type PhoneProvider = Management.GetBrandingPhoneProviderResponseContent;
export default class PhoneProviderHandler extends DefaultHandler {
    existing: PhoneProvider[] | null;
    constructor(options: DefaultHandler);
    objString(provider: PhoneProvider): string;
    getType(): Promise<PhoneProvider[] | null>;
    getPhoneProviders(): Promise<PhoneProvider[] | null>;
    processChanges(assets: Assets): Promise<void>;
    deletePhoneProviders(): Promise<void>;
    updatePhoneProviders(phoneProviders: PhoneProvider[]): Promise<void>;
}
