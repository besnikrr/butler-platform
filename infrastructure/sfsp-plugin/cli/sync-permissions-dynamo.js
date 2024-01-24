const path = require("path");
const yaml = require('js-yaml')
const { readdirSync, existsSync, readFileSync } = require('fs')
const { marshall } = require('@aws-sdk/util-dynamodb')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {DocumentClient} = require('aws-sdk/clients/dynamodb');

const absolutePath = path.resolve('./');
const appsDirectory=absolutePath + '/../../../apps'
const mainTableName = 'main-local'
const dynamoLocalConfig = {region: 'us-east-1', endpoint: 'http://localhost:8000'}
const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const allServiceFunctions = []
const updateKeys = []
const deleteKeys = []
const appsUpdateKeys = []
const dynamoClient = new DynamoDBClient(dynamoLocalConfig);
const dynamoDBDocumentClient = new DocumentClient(dynamoLocalConfig);
const {
    dynamo
} = require('../services')
const dynamoService = dynamo(dynamoClient)

const updatePermissions = async (tableName, role, permissions) => {
    const params = {
        TableName: tableName,
        Key: {
            pk: 'role',
            sk: `${role}`,
        },
        UpdateExpression: 'set #permissions = :permissions',
        ExpressionAttributeNames: {
            '#permissions': 'permissions',
        },
        ExpressionAttributeValues: {
            ":permissions": permissions,
        }
    };
    console.log({ params })
    return await dynamoDBDocumentClient.update(params).promise()
}

function initSetup() {
    const dirs = getDirectories(appsDirectory)
    const permissionsCollection = []
    dirs.forEach(dir => {
        if (dir.startsWith('service-')) {
            const serverlessFilePath = appsDirectory + '/' + dir + '/serverless.yml'
            if (existsSync(appsDirectory)) {
                try {
                    const serverlessFile = parseYMLFile(serverlessFilePath);
                    if (!serverlessFile.service || serverlessFile.service === '') {
                        throw 'Service name missing in serverless.yml file'
                    }
                    const serviceName = serverlessFile.service;
                    const appDefinition = serverlessFile.custom && serverlessFile.custom['app-definition'];
                    if (!serverlessFile || !serverlessFile.functions)
                        return
                    serverlessFile.functions.forEach(srvlsFn => {
                        const filePath = srvlsFn.slice(8, -2)
                        const functionsDir = appsDirectory + '/' + dir + filePath
                        const serviceFunctionData = parseFunctionFiles(functionsDir, serviceName);
                        if (allServiceFunctions[serviceFunctionData.service]) {
                            allServiceFunctions[serviceFunctionData.service].functions = allServiceFunctions[serviceFunctionData.service].functions.concat(serviceFunctionData.functions);
                        } else {
                            allServiceFunctions[serviceFunctionData.service] = {
                                service: serviceFunctionData.service,
                                functions: serviceFunctionData.functions,
                                appDefinition,
                            }
                        }
                    });

                } catch (e) {
                    console.log(e)
                }
            }
        }
    });

    Object.keys(allServiceFunctions).forEach(k => {
        const serviceFunction = allServiceFunctions[k];
        appsUpdateKeys.push(dynamoService.constructUpdateKey(mainTableName, marshall({
                pk: 'app',
                sk: `app::${serviceFunction.service}`,
                ...serviceFunction.appDefinition
            }))
        );
        serviceFunction.functions.forEach(func => {
            if (!func.events)
                return
            const httpEvent = func.events.find((e) => e.http)
            if (!httpEvent) {
                return
            }
            const path = httpEvent.http.path.replace('${self:service}', serviceFunction.service).replace(new RegExp('\{(.*?)\}', 'gm'), '*')
            const method = httpEvent.http.method
            const permissionName = func.permissionName
            //todo: validate unique permissions throughout all apps
            if (!permissionName) {
                return
            }
            const pk = 'permission'
            const sk = `permission::${serviceFunction.service}::${permissionName}`
            permissionsCollection.push(sk)

            const Item = marshall({
                arn: `local/arn/${method}/api${path}`,
                created_at: Date.now(),
                pk,
                sk,
                gs1pk: 'app',
                gs1sk: serviceFunction.service
            })
            updateKeys.push(dynamoService.constructUpdateKey(mainTableName, Item))
            deleteKeys.push(dynamoService.constructDeleteKey(mainTableName, pk, sk))
        })
    })

    console.log('==============================\n')
    console.log('permissions-collection: ', JSON.stringify(permissionsCollection))
    console.log('==============================\n')
}

const getYamlSchema = () => {
    const importValueYamlType = new yaml.Type('!ImportValue', { kind: 'scalar' });
    const refYamlType = new yaml.Type('!Ref', { kind: 'scalar' });
    const joinYamlType = new yaml.Type('!Join', { kind: 'scalar' });

    return yaml.Schema.create([importValueYamlType, refYamlType, joinYamlType]);
};

function parseYMLFile(filePath) {
    return yaml.load(readFileSync(filePath, 'utf8'), {
        schema: getYamlSchema()
    });
}

function parseFunctionFiles(path, serviceName) {
    const data = {
        service: serviceName,
        functions: []
    }
    const ymlParsed = parseYMLFile(path)
    if (ymlParsed) {
        Object.keys(ymlParsed).forEach(key => {
            if (ymlParsed[key])
                data.functions.push(ymlParsed[key])
        })
    }
    return data
}

async function main() {
    initSetup()
    const transactUpdateItems = appsUpdateKeys.concat(updateKeys)

    console.log('transact-update-items: ', JSON.stringify(transactUpdateItems))
    console.log('deleteKeys: ', JSON.stringify(deleteKeys))

    await dynamoService.doTransaction(deleteKeys)
    await dynamoService.doTransaction(transactUpdateItems)
    updatePermissions('iam-local-butler', 'role::super_admin', transactUpdateItems.map(i => i.Put.Item.sk.S).filter(i => i.startsWith('permission::')));

    console.log('transaction-completed')
}

main()