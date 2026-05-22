import { Management } from 'auth0';
import DefaultHandler from './default';
import { Asset, Assets } from '../../../types';
export type TokenExchangeProfile = Management.TokenExchangeProfileResponseContent;
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            subject_token_type: {
                type: string;
                description: string;
            };
            action: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export default class TokenExchangeProfilesHandler extends DefaultHandler {
    existing: TokenExchangeProfile[];
    private actions;
    constructor(config: DefaultHandler);
    private sanitizeForExport;
    private sanitizeForAPI;
    getActions(): Promise<Asset[]>;
    getType(): Promise<TokenExchangeProfile[]>;
    processChanges(assets: Assets): Promise<void>;
    createTokenExchangeProfile(profile: TokenExchangeProfile): Promise<TokenExchangeProfile>;
    createTokenExchangeProfiles(creates: TokenExchangeProfile[]): Promise<void>;
    updateTokenExchangeProfile(profile: TokenExchangeProfile): Promise<void>;
    updateTokenExchangeProfiles(updates: TokenExchangeProfile[]): Promise<void>;
    deleteTokenExchangeProfile(profile: TokenExchangeProfile): Promise<void>;
    deleteTokenExchangeProfiles(data: TokenExchangeProfile[]): Promise<void>;
}
