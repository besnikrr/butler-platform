const AWS = require('aws-sdk')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const {
	dynamo,
	permission,
	functions,
	tenant,
	notification,
	apps
} = require('./services');

const config = { region: 'us-east-1' }
const dynamoDB = new DynamoDBClient(config)
const sns = new AWS.SNS(config)

const dynamoService = dynamo(dynamoDB)
const permissionService = permission(dynamoDB)
const tenantService = tenant(dynamoDB)
const functionService = functions()
const notificationService = notification(sns)
const appService = apps()

/**
 * Purpose of this plugin
 *
 * Replace/Renew/Update/Insert Permissions of the deployed service
 * If there is an http exposed api it must have a permissionName property
 * or exception will be thrown.
 *
 * Provision tenant based resources i.e
 * A new dynamoDB table will be provisioned - it should be multiplied all across tenants
 * A new s3 bucket will be provisioned - it should be multiplied all across tenants
 */

class ServerlessPlugin {
	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options;
		this.serviceDeployedTopic = null;
		this.configurationBucket = null;
		this.accountId = ''
		this.mainTable = '';
		this.TENANTS_API_GATEWAY = ''
		this.appDefinition = {}
		this.commands = {
      sfsp: {
        usage: 'Helps you start your first Serverless plugin',
        lifecycleEvents: [
          'prepare',
          'exec',
        ],
      },
    };
		this.hooks = {
			'sfsp:prepare': this._prepareHook,
			'sfsp:exec': this._execHook
		};
	}

	initVariables = () => {
		this.serviceName = this.serverless.service.serviceObject.name
		this.accountId = this.serverless.service.initialServerlessConfig.custom.accountId
		this.configurationBucket = 'configurationsettings'
		this.serviceDeployedTopic = {
			TopicArn: this.serverless.service.initialServerlessConfig.custom.AFTER_DEPLOY_TOPIC
		}
		this.stage = this.serverless.pluginManager.cliOptions.stage
		this.mainTable = this.serverless.service.initialServerlessConfig.custom.TABLE_MAIN
		this.TENANTS_API_GATEWAY = this.serverless.service.initialServerlessConfig.custom.TENANTS_API_GATEWAY
		this.region = this.serverless.pluginManager.cliOptions.region
		this.appDefinition = this.serverless.service.initialServerlessConfig.custom['app-definition']

		console.log({
			serviceName: this.serviceName,
			accountId: this.accountId,
			stage: this.stage,
			mainTable: this.mainTable,
			TENANTS_API_GATEWAY: this.TENANTS_API_GATEWAY,
			region: this.region,
			appDefinition: this.appDefinition,
			serviceDeployedTopic: this.serviceDeployedTopic.TopicArn
		})
	}

	_prepareHook = async () => {
		this.initVariables()
		functionService.validate(this.serverless.service.functions)
		tenantService.replaceResources(this.serverless.service.resources, this.stage)
	}

	_execHook = async () => {
		const currentServicePermissions = await permissionService.getByService(
			this.mainTable,
			this.serviceName
		)
		try {
			await this.transactionUpdatePermissions(
				currentServicePermissions.Items,
				this.serviceName,
				this.accountId,
				this.TENANTS_API_GATEWAY
			);
		} catch (e) {
			console.log('error[failed-transactionUpdatePermissions]: ', e)
		}
		if (this.serviceDeployedTopic && this.serviceDeployedTopic.TopicArn)
			await notificationService.notifyDeploy(this.serviceName, this.stage, this.serviceDeployedTopic)
		else
			console.log('No topicARN set after service deploy')
	}

	constructUpdateKeys = (appName, accountId, lambdaGatewayId) => {
		const permissionUpdateKeys = [];
		const appsUpdateKeys = [];
		const functions = this.serverless.service.functions;
		let apps = new Map();
		const _this = this

		Object.keys(functions).forEach((key) => {
			Object.keys(functions[key].events).forEach((evnt) => {
				const obj = functions[key].events[evnt];
				if (obj.http) {
					if (!obj.http.method || !obj.http.path) {
						throw 'Should be implemented before deploy this check'
					}
					if (functions[key].permissionName) {
						permissionUpdateKeys.push(dynamoService.constructUpdateKey(this.mainTable, marshall({
							pk: 'permission',
							sk: `permission::${appName}::${functions[key].permissionName}`,
							created_at: Date.now(),
							arn: _this.createARN(accountId, lambdaGatewayId, obj.http.method.toUpperCase(), obj.http.path),
							functionName: functions[key].name,
						})))
						apps.set(
							appName,
							appService.getDefinition(appName, this.appDefinition)
						)
					}
				}
			})
		});

		apps.forEach((app) => {
			appsUpdateKeys.push({
				Put: {
					TableName: this.mainTable,
					Item: marshall(app)
				}
			})
		})

		return [permissionUpdateKeys, appsUpdateKeys];
	}

	constructDeleteKeys = (currentPermissions) => {
		const keys = []
		currentPermissions.forEach(currentPermission => {
			const ob = unmarshall(currentPermission)
			keys.push(dynamoService.constructDeleteKey(this.mainTable, ob.pk, ob.sk))
		})
		return keys
	}

	transactionUpdatePermissions = async (currentPermissions, serviceName, accountId, apiGatewayId) => {
		const deleteKeys = this.constructDeleteKeys(currentPermissions)
		const [permissionUpdateKeys, appUpdateKeys] = this.constructUpdateKeys(serviceName, accountId, apiGatewayId);
		await dynamoService.doTransaction(deleteKeys)
		await dynamoService.doTransaction(permissionUpdateKeys)
		await dynamoService.doTransaction(appUpdateKeys)
	}

	createARN = (accountId, apiId, action, path) => {
		return "arn:aws:execute-api:" +
			`${this.region}:${accountId}:${apiId}/${this.stage}/${action}` +
			`/api${path.replace(new RegExp('\{(.*?)\}', 'gm'), '*')}`
	}
}

module.exports = ServerlessPlugin;
