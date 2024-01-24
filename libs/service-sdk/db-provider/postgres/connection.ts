import { AppEnum } from "@butlerhospitality/shared";
import { AnyEntity, EntityRepository, MikroORM, EventSubscriber } from "@mikro-orm/core";
import { EntityClass } from "@mikro-orm/core/typings";
import * as AWS from "aws-sdk";

const tenantMap = {};
const defaultDBType = "postgresql";
const secretManager = new AWS.SecretsManager({ region: process.env.REGION });

export interface IMikroORMConnectionDependency {
  tenant: string;
  dbname: string;
  service: AppEnum;
  entities: EntityClass<AnyEntity>[];
  pooling: boolean;
  subscribers: EventSubscriber<AnyEntity>[];
}

const getConnectionIdentifier = (dependency: IMikroORMConnectionDependency) => {
  return dependency.tenant + dependency.service;
};

export const getConnection = async (dependency: IMikroORMConnectionDependency): Promise<DIConnectionObject<any>> => {
  if (!dependency.pooling) {
    return setConnection(dependency);
  }
  const connectionId = getConnectionIdentifier(dependency);
  if (tenantMap[connectionId]) {
    tenantMap[connectionId].conn.em = tenantMap[connectionId].conn.mainEntityManager.fork();
    return tenantMap[connectionId];
  } else {
    return (setConnection(dependency));
  }
};

export const setConnection = async (
  dependency: IMikroORMConnectionDependency
): Promise<DIConnectionObject<any>> => {
  const id = getConnectionIdentifier(dependency);
  tenantMap[id] = await connect(dependency);
  tenantMap[id].conn.mainEntityManager = tenantMap[id].conn.em;
  tenantMap[id].conn.em = tenantMap[id].conn.em.fork();
  return tenantMap[id];
};

export interface DIConnectionObject<T> {
  conn: MikroORM;
  repositories: { [key: string]: EntityRepository<T>; };
}

const getTenantConfig = async (tenant: string) => {
  if (process.env.STAGE === "local") {
    const tenants = process.env.TENANTS;
    return JSON.parse(tenants);
  }

  const secretval = await secretManager.getSecretValue({
    SecretId: `${process.env.STAGE}/tenants/${tenant}`
  }).promise();

  const secret = JSON.parse(secretval.SecretString);
  return {
    [tenant]: {
      username: secret.aurora_master_user,
      host: secret.aurora_endpoint,
      password: secret.aurora_master_user_password
    }
  };
};

const connect = async (dependency: IMikroORMConnectionDependency): Promise<DIConnectionObject<any>> => {
  const {
    tenant, dbname, entities, pooling, subscribers = []
  } = dependency;
  const tenantConfig = await getTenantConfig(tenant);
  const poolConfig = { min: 0, max: 10 };
  const conn = await MikroORM.init({
    ...(pooling && { pool: poolConfig }),
    ...(subscribers && { subscribers }),
    entities,
    discovery: {
      warnWhenNoEntities: true, // by default, discovery throws when no entity is processed
      requireEntitiesArray: true, // force usage of class references in `entities` instead of paths
      alwaysAnalyseProperties: false // do not analyse properties when not needed (with ts-morph)
    },
    user: tenantConfig[tenant].username,
    host: tenantConfig[tenant].host,
    password: tenantConfig[tenant].password,
    type: defaultDBType,
    dbName: dbname,
    debug: process.env.NODE_ENV === "development" && process.env.STAGE === "local",
    migrations: {
      tableName: "mikroorm_migrations",
      path: "./db/migrations",
      pattern: /^[\w-]+\d+\.js$/,
      emit: "js"
    }
  });
  return {
    conn,
    repositories: null
  };
};

export const connection = {
  getConnection
};
