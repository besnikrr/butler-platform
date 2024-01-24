const { QueryCommand, UpdateItemCommand, TransactWriteItemsCommand } = require('@aws-sdk/client-dynamodb')
const { marshall } = require('@aws-sdk/util-dynamodb')

const permission = (db) => {
    const getByService = async (tableName, serviceName) => {
        return await db.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
            ExpressionAttributeValues: marshall({
                ':pk': 'permission',
                ':sk': `permission::${serviceName}`
            })
        }));
    }

    return {
        getByService
    }
}

const functions = () => {
    const findDuplicates = (arr) => {
        let sorted_arr = arr.slice().sort();
        let results = [];
        for (let i = 0; i < sorted_arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i] && sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }
        return results;
    }

    const validate = (functions) => {
        let permissions = [];
        Object.keys(functions).forEach((key) => {
            let authorizer = false
            const hasHttp = functions[key].events.find((evnt) => {
                return Object.keys(evnt).find((obj) => {
                    authorizer = evnt[obj].authorizer || false
                    return obj === 'http'
                });
            })
            if (hasHttp && !functions[key].permissionName && authorizer) {
                throw `Invalid function ${key}. HTTP event must have permissionName defined`;
            }
            if (functions[key].permissionName && functions[key].permissionName !== 'undefined')
                permissions.push(functions[key].permissionName);
        });

        const duplicates = findDuplicates(permissions);
        if (duplicates && duplicates.length) {
            throw `Duplicate permissions ${duplicates}`;
        }
    }

    return {
        validate
    }
}

const role = (db) => {
    const getByPermission = async (tableName, permissionName) => {
        return await db.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk',
            FilterExpression: "contains (apppermissions, :permission)",
            ExpressionAttributeValues: marshall({
                ":pk": "role",
                ":permission": `${permissionName}`,
            })
        }));
    }
    const updatePermissions = async (tableName, role, permissions) => {
        return await db.send(new UpdateItemCommand({
            TableName: tableName,
            Key: marshall({
                pk: 'role',
                sk: `${role.sk}`
            }),
            UpdateExpression: 'set apppermissions = :permissions',
            ExpressionAttributeValues: {
                ":permissions": permissions
            }
        })).promise();
    }

    return {
        getByPermission,
        updatePermissions
    }
}


const tenant = (db) => {
    const getAll = async (tableName) => {
        return await db.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: marshall({
                ':pk': `tenant`,
            }),
        })).promise();
    }

    const replaceResources = (resources, stage) => {
        if (!resources)
            return
        const { Resources } = resources
        //replace with call to get tenants from maintable
        let tenants = [
            {
                name: 'butler'
            }
        ]
        if (stage === 'prod') {
            // throw 'NOT IMPLEMENTED'
            tenants = [
                {
                    name: 'butler'
                }
            ]
        }

        const existingResources = Object.assign({}, Resources)

        const newResources = {}
        Object.keys(existingResources).forEach(resourceKey => {
            if (existingResources[resourceKey].Type === 'AWS::DynamoDB::Table') {
                tenants.forEach((tenant) => {
                    const resource = JSON.parse(JSON.stringify(existingResources[resourceKey]))
                    let tableName = resource.Properties.TableName
                    const splitTableName = tableName.split('-')
                    if (splitTableName.length >= 3) {
                        tableName = splitTableName.splice(0, 2).join('-')
                    }
                    tableName += `-${tenant.name}`
                    resource.Properties.TableName = tableName
                    newResources[`${resourceKey}${tenant.name}`] = resource
                })
                delete resources.Resources[resourceKey]
            }
        })

        Object.keys(newResources).forEach(newResourceKey => {
            resources.Resources[newResourceKey] = newResources[newResourceKey]
        })
    }

    return {
        getAll,
        replaceResources
    }
}


const dynamo = (db) => {
    const batchWrite = async (items) => {
        return await db.send(new TransactWriteItemsCommand({
            TransactItems: items
        }))
    }

    const doTransaction = async (keys) => {
        const parts = Math.ceil(keys.length / 25)
        for (let i = 0; i < parts; i++) {
            const start = 25 * i
            const end = i === 0 ? 25 : 25 * (i + 1)
            await batchWrite(keys.slice(start, end))
        }
    }

    const constructUpdateKey = (tableName, item) => {
        return {
            Put: {
                TableName: tableName,
                Item: item,
            },
        }
    }

    const constructDeleteKey = (tableName, pk, sk) => {
        return {
            Delete: {
                TableName: tableName,
                Key: marshall({
                    pk,
                    sk,
                }),
            },
        }
    }

    return {
        doTransaction,
        constructUpdateKey,
        constructDeleteKey
    }
}

const notification = (sns) => {
    const notifyDeploy = async (serviceName, stage, serviceDeployedTopic) => {
        const { TopicArn } = serviceDeployedTopic
        if (!TopicArn)
            return
        const published = await sns.publish({
            TopicArn,
            Message: JSON.stringify({
                type: 'SERVICE_UPDATE',
                serviceName: serviceName,
                stage: stage
            })
        }).promise();
        console.log('service-deploy-notify: ', published)
    }

    return {
        notifyDeploy
    }
}

const apps = () => {
    const getDefinition = (appName, appDefinition) => {
        const dashboardSettings = appDefinition['dashboard-settings']
        return {
            sk: `app::${appName}`,
            name: appDefinition.name || `${appName}`,
            description: appDefinition.description || "tbdf description",
            dashboardSettings: {
                icon: dashboardSettings.icon || `${appName}`,
                path: dashboardSettings.path || `${appName}`,
                color: dashboardSettings.color || "#7B61FF",
                title: dashboardSettings.title || `${appName}`,
                iconColor: dashboardSettings.iconColor || `#000000`
            },
            pk: "app"
        }
    }

    return {
        getDefinition
    }
}

module.exports = {
    permission,
    functions,
    role,
    tenant,
    dynamo,
    notification,
    apps
}
