import * as AWS from 'aws-sdk';

import { SNSEvent } from 'aws-lambda';
import { getSingle, insert, queryexec, update } from './pgutil';

const dynamoDB = new AWS.DynamoDB.DocumentClient(
  process.env.STAGE === 'local' ? {
    region: 'localhost',
    endpoint: 'http://localhost:4566',
  } : {});

const afterServiceDeploy = async (event: SNSEvent) => {

  console.log('event: ', event)
  const record = JSON.parse(event.Records[0].Sns.Message)
  const serviceName = record.serviceName //this is our app name also

  const data = await dynamoDB.query({
    TableName: process.env.MAIN_TABLE || '',
    KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk'
    },
    ExpressionAttributeValues: {
      ':pk': 'permission',
      ':sk': `permission::${serviceName}`
    }
  }).promise()

  const appdata = await dynamoDB.get({
    TableName: process.env.MAIN_TABLE || '',
    Key: {
      pk: 'app',
      sk: `app::${serviceName}`
    },
  }).promise()

  console.log('app-=data: ', appdata)

  console.log('event-came-here', record)
  console.log('data: ', data)

  let app = await getSingle({
    text: 'select * from app where name = $1',
    values: [serviceName]
  })

  console.log('found-app: ', app)
  if (Object.keys(app).length === 0) {
    console.log('not-found-app: ', app)
    app = await insert('app', {
      name: serviceName,
      description: appdata.Item?.description,
      dashboard_settings: appdata.Item?.dashboardSettings
    })
    console.log('inserted-new-app: ', app)
  } else {
    //update the dashboard settings
    try {
      await update('app', app.id, {dashboard_settings: appdata.Item?.dashboardSettings})
    } catch (e) {
      console.log('error-updating-app-dbsettings: ', e)
    }
  }

  console.log('app-in-the-end: ', app)

  const permissionsToInsert: any[] = []
  const generalPermissionGroupName = `${String(app.name)}-ALL-GROUP`
  let permissionGroup = await getSingle({
    text: 'select * from permissiongroup where name = $1',
    values: [generalPermissionGroupName]
  })

  if (Object.keys(permissionGroup).length === 0) {
    permissionGroup = await insert('permissiongroup', { name: generalPermissionGroupName })
  }

  data.Items?.forEach((el: any) => {
    const permComposite = el.sk.split('::')
    if (el.arn)
      permissionsToInsert.push({ name: String(permComposite[2]), arn: el.arn, app_id: app.id })
    return
  });

  const permissionGroupPermissionMapper = (permgroup: any, permissions: any[]) => {
    return permissions.map((permission: any) => {
      return {
        permissiongroup_id: permgroup.id,
        permission_id: permission.id
      }
    })
  }

  if (permissionsToInsert) {
    try {
      //todo: make this a transaction
      await queryexec({
        text: 'delete from permission where app_id = $1',
        values: [app.id]
      })
      const insertedPermissions = await insert('permission', permissionsToInsert)
      console.log('insertedPermissions: ', insertedPermissions)
      const insertedPermissionsGroupPermissions = await insert('permissiongroup_permission', permissionGroupPermissionMapper(permissionGroup, insertedPermissions))
      console.log('permission-group-permissions: ', insertedPermissionsGroupPermissions)
    } catch (e) {
      console.log('error-insert: ', e)
    }
  }
}


export {
  afterServiceDeploy
};
