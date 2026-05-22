declare const _default: {
    type: string;
    $schema: string;
    properties: {
        exclude: {
            type: string;
            properties: {
                [key: string]: Object;
            };
            default: {};
        };
        include: {
            type: string;
            properties: {
                [key: string]: Object;
            };
            default: {};
        };
    };
    additionalProperties: boolean;
};
export default _default;
