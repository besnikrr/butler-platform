import { MikroORM } from "@mikro-orm/core";

export interface Tenant {
  id: string;
  name: string;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  roles: string[];
  permissions: any[];
  hotel_id?: string;
}
export interface ActionContext {
  tenant: Tenant;
  authorizedUser: AuthorizedUser;
}

export interface HTTPResourceResponse<T> {
  payload?: T;
  total?: string;
  nextPage?: number;
}
export interface IValidateUsecaseDependency {
  validate: boolean;
}
export interface IDefaultUsecaseDependency extends IValidateUsecaseDependency {
  conn: MikroORM;
  tenant: string;
}

export interface ITenant {
  id: number;
  name: string;
  domain: string;
  cognito?: { poolId: string; clientId: string };
  jwks: string;
  awsDefaultRegion: string;
}

