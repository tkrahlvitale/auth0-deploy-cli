import { Management } from 'auth0';
import { Asset, Assets, Auth0APIClient, CalculatedChanges } from '../../../types';
import DefaultAPIHandler from './default';
import { UserAttributeProfile } from './userAttributeProfiles';
declare const SelfServiceProfileCustomTextLanguageEnum: {
    readonly en: "en";
};
declare const SelfServiceProfileCustomTextPageEnum: {
    readonly getStarted: "get-started";
};
type customTextType = {
    [SelfServiceProfileCustomTextLanguageEnum.en]: {
        [SelfServiceProfileCustomTextPageEnum.getStarted]: Object;
    };
};
type SsProfile = Management.SelfServiceProfile;
export type SsProfileWithCustomText = Omit<SsProfile, 'created_at' | 'updated_at'> & {
    customText?: customTextType;
};
export declare const schema: {
    type: string;
    items: {
        type: string;
        properties: {
            id: {
                type: string;
            };
            name: {
                type: string;
            };
            description: {
                type: string;
            };
            user_attributes: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        name: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                        is_optional: {
                            type: string;
                        };
                    };
                };
            };
            allowed_strategies: {
                type: string;
                description: string;
                items: {
                    type: string;
                    enum: ("samlp" | "pingfederate" | "adfs" | "waad" | "google-apps" | "okta" | "oidc" | "auth0-samlp" | "okta-samlp" | "keycloak-samlp")[];
                };
            };
            branding: {
                type: string;
                properties: {
                    logo_url: {
                        type: string;
                    };
                    colors: {
                        type: string;
                        properties: {
                            primary: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            customText: {
                type: string;
                properties: {
                    en: {
                        type: string;
                        properties: {
                            "get-started": {
                                type: string;
                            };
                        };
                    };
                };
            };
            user_attribute_profile_id: {
                type: string;
            };
        };
        required: string[];
    };
};
export default class SelfServiceProfileHandler extends DefaultAPIHandler {
    existing: SsProfileWithCustomText[];
    constructor(config: DefaultAPIHandler);
    objString(item: any): string;
    getType(): Promise<SsProfileWithCustomText[]>;
    processChanges(assets: Assets): Promise<void>;
    updateCustomText(ssProfileId: string, customText: customTextType): Promise<void>;
    createSelfServiceProfiles(creates: CalculatedChanges['create']): Promise<void>;
    createSelfServiceProfile(profile: SsProfileWithCustomText): Promise<Asset>;
    updateSelfServiceProfiles(updates: CalculatedChanges['update']): Promise<void>;
    updateSelfServiceProfile(profile: SsProfileWithCustomText): Promise<Asset>;
    deleteSelfServiceProfiles(deletes: CalculatedChanges['del']): Promise<void>;
    deleteSelfServiceProfile(profile: SsProfileWithCustomText): Promise<void>;
    getUserAttributeProfiles(auth0Client: Auth0APIClient, selfServiceProfiles: SsProfileWithCustomText[]): Promise<UserAttributeProfile[]>;
    hasConflictingUserAttribute(profile: SsProfileWithCustomText): boolean;
}
export {};
