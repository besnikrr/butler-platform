export declare const SNS_TOPIC: {
    IAM: {
        USER: string;
    };
    NETWORK: {
        HUB: string;
        HOTEL: string;
        CITY: string;
    };
    MENU: {
        MODIFIER: string;
        CATEGORY: string;
        PRODUCT: string;
        MENU: string;
    };
    VOUCHER: {
        PROGRAM: string;
    };
    ORDER: {
        ORDER: string;
    };
};
export declare const ENTITY: {
    IAM: {
        USER: string;
    };
    NETWORK: {
        CITY: string;
        HUB: string;
        HOTEL: string;
    };
    MENU: {
        MODIFIER: string;
        CATEGORY: string;
        PRODUCT: string;
        MENU: string;
        OUT_OF_STOCK: string;
    };
    VOUCHER: {
        PROGRAM: string;
    };
    ORDER: {
        ORDER: string;
    };
};
export declare enum STAGE {
    test = "test",
    dev = "dev",
    local = "local",
    prod = "prod",
    qa = "qa"
}
