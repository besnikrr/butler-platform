import { Tree, formatFiles, generateFiles, joinPathFragments, readProjectConfiguration, logger } from '@nrwl/devkit';

export default async function (tree: Tree, schema: any) {
	const serviceRoot = readProjectConfiguration(tree, schema.service).root;
	logger.info(`Generating listener files in ${serviceRoot}`);
	//cammelCase to kebab-case
	schema.listenerName = schema.listener.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
	generateFiles(tree, joinPathFragments(__dirname, './files'), serviceRoot, schema);
	await formatFiles(tree);

	const serverlessPath = `${serviceRoot}/serverless.yml`;
	logger.info(`Updating ${serverlessPath}`);
	const serverlessContent = tree.read(serverlessPath);
	if (serverlessContent) {
		const serverlessContentString = serverlessContent.toString();
		const listenerResourceContent = `\${file(./infrastructure/serverless/listeners/${schema.listenerName}.yml)}`;
		const customImportedVariable = `${schema.queue}: !ImportValue \${self:provider.stage}-ext-${schema.queue}`;
		const environmentVariable = `${schema.queue}: \${self:custom.ext-config.${schema.queue}}`;
		let updatedContent = serverlessContentString;
		if (serverlessContent.indexOf(listenerResourceContent) === -1) {
			updatedContent = updatedContent.replace('functions:', `functions:
  - ${listenerResourceContent}`);
		}
		if (serverlessContent.indexOf(customImportedVariable) === -1) {
			if (serverlessContent.indexOf("ext-config:") === -1) {
				updatedContent = updatedContent.replace('custom:', `custom:
  ext-config:
    ${customImportedVariable}`);
			} else {
				updatedContent = updatedContent.replace('ext-config:', `ext-config:
    ${customImportedVariable}`);
			}
		}
		if (serverlessContent.indexOf(environmentVariable) === -1) {
			updatedContent = updatedContent.replace('environment:', `environment:
    ${environmentVariable}`);
		}

		tree.write(serverlessPath, updatedContent);
		logger.info(`Updated ${serverlessPath}`);
	} else {
		logger.warn(`sqs already exists in ${serverlessPath}`);
	}
}