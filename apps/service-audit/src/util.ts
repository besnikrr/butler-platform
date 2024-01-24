import { SecretsManager } from "aws-sdk";
import * as _ from "lodash";
import { Pool } from "pg";
import { ISNSMessage } from "./shared/interfaces";

const auditFields = ["created_at", "updated_at", "deleted_at"];
const fieldsToOmit = ["oms_id", ...auditFields];

export const parseSQSRequest = (event: any): ISNSMessage[] => {
  const messages: ISNSMessage[] = event.Records.map((record: any) => {
    const body = JSON.parse(record.body);
    const { data, context } = JSON.parse(body.Message);
    const topic = body.TopicArn;
    const service = getServiceNameFromTopicArn(topic);

    return {
      data,
      context,
      topic,
      service
    } as ISNSMessage;
  });

  return messages;
};

export const parseRedisRequest = (event: any): ISNSMessage[] => {
  const messages = event.Records.map((record: any) => {
    const { data, context, topicName } = JSON.parse(record.body);

    const topic = topicName;
    const service = getServiceNameFromTopicName(topicName);

    return {
      data,
      context,
      topic,
      service
    } as ISNSMessage;
  });

  return messages;
};

export function findObjectDifference(object: any, base: any) {
  if (!base) return object;
  const result = _.transform(object, (transformed, value, key) => {
    if (!_.has(base, key)) return;
    if (!_.isEqual(value, base[key]) &&
      (!value || typeof value !== "object" || Array.isArray(value))
    ) {
      transformed[key] =
        _.isPlainObject(value) && _.isPlainObject(base[key]) ?
          findObjectDifference(base[key], value) :
          value;
    }
  });

  // Map removed fields to undefined
  _.forOwn(base, (value, key) => {
    if (!_.has(object, key)) result[key] = undefined;
  });
  // Strip audit fields
  const strippedResult = Object.keys(result).reduce((acc, key) => {
    if (!fieldsToOmit.includes(key)) {
      acc[key] = result[key];
    }

    return acc;
  }, {});

  return strippedResult;
}

export const getPostgresConnection = async (): Promise<Pool> => {
  const isLocal = process.env.STAGE === "local";
  let auditPool: Pool;

  if (isLocal) {
    auditPool = new Pool({
      user: process.env.POSTGRES_USERNAME,
      database: process.env.DB,
      host: process.env.POSTGRES_HOST,
      password: process.env.POSTGRES_PASSWORD,
      port: +process.env.POSTGRES_PORT
    });
  } else {
    const secretManager = new SecretsManager({ region: process.env.REGION });

    const secretval = await secretManager.getSecretValue({
      SecretId: `${process.env.STAGE}/tenants/butler`
    }).promise();

    const database = process.env.DB;
    const {
      aurora_master_user: username,
      aurora_endpoint: host,
      aurora_master_user_password: password
    } = JSON.parse(secretval.SecretString);

    auditPool = new Pool({
      user: username,
      database: database,
      host: host,
      password: password,
      port: 5432
    });
  }

  // Once new cluster for audit is created
  // new Pool({
  // 	user: process.env.PG_POOL_PLATFORM_USER,
  // 	database: process.env.PG_POOL_PLATFORM_DB,
  // 	host: process.env.PG_POOL_PLATFORM_HOST,
  // 	password: process.env.PG_POOL_PLATFORM_PASSWORD,
  // 	port: +process.env.PG_POOL_PLATFORM_PORT,
  // });

  auditPool.on("error", (error, client) => {
    console.error("Unexpected error on idle postgresql client - audit", error);
  });

  return auditPool;
};

export const getServiceNameFromTopicArn = (topicArn: string): string => {
  const topicName = topicArn.split(":")[5];
  const serviceName = topicName.split("_")[1];

  return serviceName.toLowerCase();
};

export const getServiceNameFromTopicName = (topicName: string): string => {
  const serviceName = topicName.split(/(?=[A-Z])/)[1];

  return serviceName?.toLowerCase() ?? "local";
};

