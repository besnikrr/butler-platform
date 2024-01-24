const path = require("path");
const yaml = require('js-yaml');
const { readdirSync, existsSync, readFileSync } = require('fs')
const { Pool } = require('pg')

const absolutePath = path.resolve('./');
const appsDirectory=absolutePath + '/../../../apps'

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
const allServiceFunctions = []
const permissionsCollection = {}

const pool = new Pool({
    user: 'platform',
    host: '0.0.0.0',
    database: 'service_iam',
    password: 'platform',
    port: 5432,
});

const initSetup = async () => {
    const dirs = getDirectories(appsDirectory)
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

    let superAdminRoleQuery = await pool.query(`select * from role where name like 'superadmin'`)
    let superAdminID = superAdminRoleQuery.rows && superAdminRoleQuery.rows.length ? superAdminRoleQuery.rows[0].id : null
    if (!superAdminID) {
        superAdminRoleQuery = await pool.query(`insert into role (name) values ('superadmin') returning id`)
        superAdminID = superAdminRoleQuery.rows && superAdminRoleQuery.rows.length ? superAdminRoleQuery.rows[0].id : null
    }
    await pool.query(`delete from role_permissiongroup where role_id = ${superAdminID}`)

    const serviceFunctionsKeys = Object.keys(allServiceFunctions)
    for (const k of serviceFunctionsKeys) {
        const serviceFunction = allServiceFunctions[k]

        let appQuery = await pool.query(`select * from app where name = '${serviceFunction.service}'`)
        let appID = appQuery.rows && appQuery.rows.length ? appQuery.rows[0].id : null
        const dashboardSettings = serviceFunction.appDefinition && serviceFunction.appDefinition['dashboard-settings'] ? JSON.stringify(serviceFunction.appDefinition['dashboard-settings']) : '{}'
        const appDescription = serviceFunction.appDefinition && serviceFunction.appDefinition['description'] || ''

        if (appID) {
            appQuery = await pool.query(`update app set name = '${serviceFunction.service}', description = '${appDescription}', dashboard_settings = '${dashboardSettings}' where id = ${appID}`);
        } else {
            appQuery = await pool.query(`insert into app (name, description, dashboard_settings) values ('${serviceFunction.service}',  '${appDescription}', '${dashboardSettings}') returning id`)
            appID = appQuery.rows && appQuery.rows.length ? appQuery.rows[0].id : null
        }

        const permissionGroupName = `all-group-${serviceFunction.service}`
        let permGroupQuery = await pool.query(`select * from permissiongroup where name like '${permissionGroupName}'`)
        let permGroupID = permGroupQuery.rows && permGroupQuery.rows.length ? permGroupQuery.rows[0].id : null
        if (!permGroupID) {
            permGroupQuery = await pool.query(`insert into permissiongroup (name) values ('${permissionGroupName}') returning id`)
            permGroupID = permGroupQuery.rows && permGroupQuery.rows.length ? permGroupQuery.rows[0].id : null
        }

        await pool.query(`delete from permission where app_id = ${appID}`)
        await pool.query(`delete from permissiongroup_permission where permissiongroup_id = ${permGroupID}`)
        for (const func of serviceFunction.functions) {
            if (!func.events)
                continue;
            const httpEvent = func.events.find((e) => e.http)
            if (!httpEvent) {
                continue;
            }
            const path = httpEvent.http.path.replace('${self:service}', serviceFunction.service).replace(new RegExp('\{(.*?)\}', 'gm'), '*')
            const method = httpEvent.http.method
            const permissionName = func.permissionName
            //todo: validate unique permissions throughout all apps
            if (!permissionName) {
                continue;
            }

            const permissionItem = {
                name: permissionName,
                arn: `local/arn/${method}/api${path}`,
                app_id: appID
            }
            permissionsCollection[permGroupID] = permissionsCollection[permGroupID] ? permissionsCollection[permGroupID].concat(permissionItem) : [permissionItem]
        }
    }
    //check app exists

    const permKeys = Object.keys(permissionsCollection)
    for (let i = 0; i < permKeys.length; i++) {
        const permissions = permissionsCollection[permKeys[i]]
        const permissionIDs = await pool.query(`insert into permission (name, arn, app_id) values ${permissions.map(perm => {
            return `('${perm.name}', '${perm.arn}', '${perm.app_id}')`
        }).join(',')} returning id`);

        await pool.query(`insert into permissiongroup_permission (permissiongroup_id, permission_id) values ${permissionIDs.rows.map(perm => {
            return `('${permKeys[i]}', '${perm.id}')`
        }).join(',')}`)

        await pool.query(`insert into role_permissiongroup (role_id, permissiongroup_id) values (${superAdminID}, ${permKeys[i]})`)
    }

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

const main = async () => {
    await initSetup()
    console.log('transaction-completed')
}

(async () => {
    await main();
})()