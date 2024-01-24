import { Tree, formatFiles, generateFiles, joinPathFragments, readProjectConfiguration, logger } from "@nrwl/devkit";

export default async function (tree: Tree, schema: any) {
	const appRoot = readProjectConfiguration(tree, "infra-shared").root;
	const serviceRoot = readProjectConfiguration(tree, schema.service).root;
	const serviceName = schema.service
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("");
	const serviceNameResource = schema.service
		.split("-")
		.map((word) => word.toUpperCase())
		.join("_");
	const entityName = schema.entity.charAt(0).toUpperCase() + schema.entity.slice(1);
	const entityNameResource = schema.entity.toUpperCase();
	const topicName = `${serviceName}${entityName}Topic`;
	const topicNameWithStage = `${serviceNameResource}_${entityNameResource}_TOPIC-\${self:provider.stage}`;
	logger.info(`Generating SNS topic ${topicName}`);
	schema.topicName = topicName;
	schema.topicNameWithStage = topicNameWithStage;
	generateFiles(tree, joinPathFragments(__dirname, "./files"), appRoot, schema);
	await formatFiles(tree);
	const serverlessPath = `${appRoot}/serverless.yml`;
	const serviceServerlessPath = `${serviceRoot}/serverless.yml`;
	logger.info(`Updating ${serverlessPath}`);
	const contents = tree.read(serverlessPath);
	const contentsStr = contents.toString();
	const serviceServerlessContent = tree.read(serviceServerlessPath);
	const serviceServerlessContentStr = serviceServerlessContent.toString();
	const snsToInsert = `\${file(./resources/sns/${schema.service}/${schema.entity}-topic.yml)}`;

	const customImportedVariable = `${schema.topicName}: !ImportValue \${self:provider.stage}-ext-${schema.topicName}`;
	const environmentVariable = `${schema.topicName}: \${self:custom.ext-config.${schema.topicName}}`;
	let updatedContent = serviceServerlessContentStr;
	if (serviceServerlessContentStr.indexOf(customImportedVariable) === -1) {
		if (serviceServerlessContentStr.indexOf("ext-config:") === -1) {
			updatedContent = updatedContent.replace('custom:', `custom:
  ext-config:
    ${customImportedVariable}`);
		} else {
			updatedContent = updatedContent.replace('ext-config:', `ext-config:
    ${customImportedVariable}`);
		}
	}
	if (serviceServerlessContentStr.indexOf(environmentVariable) === -1) {
		updatedContent = updatedContent.replace('environment:', `environment:
    ${environmentVariable}`);
	}
	if (contentsStr.indexOf(snsToInsert) === -1) {
		let resultAfterReplace = contentsStr.replace(
			"resources:",
			`resources:
  - ${snsToInsert}`
		);
		tree.write(serverlessPath, resultAfterReplace);
		tree.write(serviceServerlessPath, updatedContent);
		logger.info(`Updated ${serverlessPath}`);
	} else {
		logger.warn(`sns already exists in ${serverlessPath}`);
	}
}
