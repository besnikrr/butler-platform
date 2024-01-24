export declare type UserChangePassword = {
    username: string;
    password: string;
};
export declare type Group = {
    Group: {
        CreationDate: number;
        Description: string;
        GroupName: string;
        LastModifiedDate: number;
        Precedence: number;
        RoleArn: string;
        UserPoolId: string;
    };
};
export declare type User = {
    User: {
        Attributes: Array<{
            Name: string;
            Value: string;
        }>;
        Enabled: boolean;
        MFAOptions: Array<{
            AttributeName: string;
            DeliveryMedium: string;
        }>;
        UserCreateDate: number;
        UserLastModifiedDate: number;
        Username: string;
        UserStatus: string;
    };
};
export declare type UserAdmin = {
    MFAOptions: [
        {
            AttributeName: string;
            DeliveryMedium: string;
        }
    ];
    PreferredMfaSetting: string;
    UserAttributes: [
        {
            Name: string;
            Value: string;
        }
    ];
    UserMFASettingList: [string];
    Username: string;
};
export declare type CreateUpdateGroupQuery = {
    GroupName: string;
    Description?: string;
    Precedence?: number;
    RoleArn?: string;
};
export declare type DeleteGroupQuery = {
    GroupName: string;
};
export declare enum ENUM_DELIVERY_MEDIUMS {
    SMS = "SMS",
    EMAIL = "EMAIL"
}
export declare enum ENUM_MESSAGE_ACTIONS {
    RESEND = 0,
    SUPPRESS = 1
}
export declare type AttributeType = {
    Name: string;
    Value: string;
};
export declare type CreateUserQuery = {
    ClientMetadata?: {
        [key: string]: string;
    };
    DesiredDeliveryMediums?: Array<ENUM_DELIVERY_MEDIUMS> | [ENUM_DELIVERY_MEDIUMS.SMS];
    TemporaryPassword?: string;
    UserAttributes?: AttributeType[];
    Username: string;
};
export declare type AddRemoveUserToGroupQuery = {
    GroupName: string;
    Username: string;
};
export declare type EnableDisableUser = {
    Username: string;
};
export declare type UpdateUserAttributesQuery = {
    Username: string;
    UserAttributes: Array<{
        Name: string;
        Value: string;
    }>;
};
export declare type ListUsersInGroupQuery = {
    GroupName: string;
    Limit?: number;
    NextToken?: string;
};
export declare type ListUsersInGroup = {
    NextToken: string;
    Users: Array<User>;
};
export declare type ListUsersQuery = {
    AttributesToGet?: Array<string>;
    Filter?: string;
    Limit?: number;
    PaginationToken?: string;
};
export declare type ListUsers = {
    PaginationToken: string;
    Users: Array<User>;
};
export declare type ListGroupsQuery = {
    Limit?: number;
    NextToken?: string;
};
export declare type ListGroups = {
    NextToken: string;
    Groups: Array<{
        CreationDate: number;
        Description: string;
        GroupName: string;
        LastModifiedDate: number;
        Precedence: number;
        RoleArn: string;
        UserPoolId: string;
    }> | [];
};
export declare type GetGroupQuery = {
    GroupName: string;
};
export declare type ResetUserPasswordQuery = {
    ClientMetadata?: {
        [key: string]: string;
    };
    Username: string;
};
export declare type SetUserPasswordQuery = {
    Username: string;
    Password: string;
    Permanent?: boolean;
};
export declare type UserSignOutQuery = {
    Username: string;
};
export declare type UserChangePasswordQuery = {
    AccessToken: string;
    PreviousPassword: string;
    ProposedPassword: string;
};
export declare type ConfirmUserSignUp = {
    Username: string;
    ClientMetadata?: {
        [key: string]: string;
    };
};
export declare type ListGroupsForUserQuery = {
    Username: string;
    Limit?: number;
    NextToken?: string;
};
export declare type UserGroupsList = {
    NextToken: string;
    Groups: Array<Group>;
};
export declare type AdminGetUserQuery = {
    Username: string;
};
export declare type GetUserQuery = {
    AccessToken: string;
};
export declare type ResetUserPasswordInput = {
    clientID: string;
    confirmationCode: string;
    password: string;
    username: string;
};
