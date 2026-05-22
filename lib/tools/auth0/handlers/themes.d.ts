import { Management } from 'auth0';
import { Assets } from '../../../types';
import DefaultHandler from './default';
/**
 * Schema
 */
export declare const schema: {
    type: string;
    items: {
        additionalProperties: boolean;
        properties: {
            borders: {
                additionalProperties: boolean;
                properties: {
                    button_border_radius: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    button_border_weight: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    buttons_style: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                    input_border_radius: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    input_border_weight: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    inputs_style: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                    show_widget_shadow: {
                        description: string;
                        type: string;
                    };
                    widget_border_weight: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    widget_corner_radius: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                };
                required: string[];
                type: string;
            };
            colors: {
                additionalProperties: boolean;
                properties: {
                    base_focus_color: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    base_hover_color: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    body_text: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    captcha_widget_theme: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    error: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    header: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    icons: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    input_background: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    input_border: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    input_filled_text: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    input_labels_placeholders: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    links_focused_components: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    primary_button: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    primary_button_label: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    secondary_button_border: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    secondary_button_label: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    success: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    widget_background: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    widget_border: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    read_only_background: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                };
                required: string[];
                type: string;
            };
            displayName: {
                description: string;
                maxLength: number;
                pattern: string;
                type: string;
            };
            fonts: {
                additionalProperties: boolean;
                properties: {
                    body_text: {
                        additionalProperties: boolean;
                        description: string;
                        properties: {
                            bold: {
                                description: string;
                                type: string;
                            };
                            size: {
                                description: string;
                                maximum: number;
                                minimum: number;
                                type: string;
                            };
                        };
                        required: string[];
                        type: string;
                    };
                    buttons_text: {
                        additionalProperties: boolean;
                        description: string;
                        properties: {
                            bold: {
                                description: string;
                                type: string;
                            };
                            size: {
                                description: string;
                                maximum: number;
                                minimum: number;
                                type: string;
                            };
                        };
                        required: string[];
                        type: string;
                    };
                    font_url: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    input_labels: {
                        additionalProperties: boolean;
                        description: string;
                        properties: {
                            bold: {
                                description: string;
                                type: string;
                            };
                            size: {
                                description: string;
                                maximum: number;
                                minimum: number;
                                type: string;
                            };
                        };
                        required: string[];
                        type: string;
                    };
                    links: {
                        additionalProperties: boolean;
                        description: string;
                        properties: {
                            bold: {
                                description: string;
                                type: string;
                            };
                            size: {
                                description: string;
                                maximum: number;
                                minimum: number;
                                type: string;
                            };
                        };
                        required: string[];
                        type: string;
                    };
                    links_style: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                    reference_text_size: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    subtitle: {
                        additionalProperties: boolean;
                        description: string;
                        properties: {
                            bold: {
                                description: string;
                                type: string;
                            };
                            size: {
                                description: string;
                                maximum: number;
                                minimum: number;
                                type: string;
                            };
                        };
                        required: string[];
                        type: string;
                    };
                    title: {
                        additionalProperties: boolean;
                        description: string;
                        properties: {
                            bold: {
                                description: string;
                                type: string;
                            };
                            size: {
                                description: string;
                                maximum: number;
                                minimum: number;
                                type: string;
                            };
                        };
                        required: string[];
                        type: string;
                    };
                };
                required: string[];
                type: string;
            };
            page_background: {
                additionalProperties: boolean;
                properties: {
                    background_color: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    background_image_url: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    page_layout: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                };
                required: string[];
                type: string;
            };
            widget: {
                additionalProperties: boolean;
                properties: {
                    header_text_alignment: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                    logo_height: {
                        description: string;
                        maximum: number;
                        minimum: number;
                        type: string;
                    };
                    logo_position: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                    logo_url: {
                        description: string;
                        pattern: string;
                        type: string;
                    };
                    social_buttons_layout: {
                        description: string;
                        enum: string[];
                        type: string;
                    };
                };
                required: string[];
                type: string;
            };
        };
        required: string[];
        type: string;
    };
};
export type Theme = Management.GetBrandingThemeResponseContent;
export default class ThemesHandler extends DefaultHandler {
    existing: Theme[] | null;
    constructor(options: DefaultHandler);
    objString(theme: Theme): string;
    getType(): Promise<Theme[] | null>;
    processChanges(assets: Assets): Promise<void>;
    deleteThemes(): Promise<void>;
    updateThemes(themes: Theme[]): Promise<void>;
    getThemes(): Promise<Theme[] | null>;
}
