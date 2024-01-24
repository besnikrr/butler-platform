export type UserChangePassword = {
  username: string;
  password: string;
};

export type Group = {
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

export type User = {
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

export type UserAdmin = {
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

export type CreateUpdateGroupQuery = {
  GroupName: string;
  Description?: string;
  Precedence?: number;
  RoleArn?: string;
};

export type DeleteGroupQuery = {
  GroupName: string;
};

export enum ENUM_DELIVERY_MEDIUMS {
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export enum ENUM_MESSAGE_ACTIONS {
  RESEND,
  SUPPRESS,
}

export type AttributeType = {
  Name: string;
  Value: string;
};

export type CreateUserQuery = {
  ClientMetadata?: { [key: string]: string };
  DesiredDeliveryMediums?: Array<ENUM_DELIVERY_MEDIUMS> | [ENUM_DELIVERY_MEDIUMS.SMS];
  // ForceAliasCreation?: boolean;
  // MessageAction?: ENUM_MESSAGE_ACTIONS;
  TemporaryPassword?: string;
  UserAttributes?: AttributeType[];
  Username: string;
  // UserPoolId: string;
  // ValidationData: [
  //    {
  //       Name: string;
  //       Value: string;
  //    }
  // ]
};

export type AddRemoveUserToGroupQuery = {
  GroupName: string;
  Username: string;
};

export type EnableDisableUser = {
  Username: string;
};

export type UpdateUserAttributesQuery = {
  Username: string;
  UserAttributes: Array<{
    Name: string;
    Value: string;
  }>;
};

export type ListUsersInGroupQuery = {
  GroupName: string;
  Limit?: number;
  NextToken?: string;
};

export type ListUsersInGroup = {
  NextToken: string;
  Users: Array<User>;
};

export type ListUsersQuery = {
  AttributesToGet?: Array<string>;
  Filter?: string;
  Limit?: number;
  PaginationToken?: string;
};

export type ListUsers = {
  PaginationToken: string;
  Users: Array<User>;
};

export type ListGroupsQuery = {
  Limit?: number;
  NextToken?: string;
};

export type ListGroups = {
  NextToken: string;
  Groups:
    | Array<{
        CreationDate: number;
        Description: string;
        GroupName: string;
        LastModifiedDate: number;
        Precedence: number;
        RoleArn: string;
        UserPoolId: string;
      }>
    | [];
};

export type GetGroupQuery = {
  GroupName: string;
};

export type ResetUserPasswordQuery = {
  ClientMetadata?: { [key: string]: string };
  Username: string;
};

export type SetUserPasswordQuery = {
  Username: string;
  Password: string;
  Permanent?: boolean;
};

export type UserSignOutQuery = {
  Username: string;
};

export type UserChangePasswordQuery = {
  AccessToken: string;
  PreviousPassword: string;
  ProposedPassword: string;
};

export type ConfirmUserSignUp = {
  Username: string;
  ClientMetadata?: { [key: string]: string };
};

export type ListGroupsForUserQuery = {
  Username: string;
  Limit?: number;
  NextToken?: string;
};

export type UserGroupsList = {
  NextToken: string;
  Groups: Array<Group>;
};

export type AdminGetUserQuery = {
  Username: string;
};

export type GetUserQuery = {
  AccessToken: string;
};

export type ResetUserPasswordInput = {
  clientID: string;
  confirmationCode: string;
  password: string;
  username: string;
};
