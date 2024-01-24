import { Tree, formatFiles, generateFiles, joinPathFragments, readProjectConfiguration, logger } from '@nrwl/devkit';

export default async function (tree: Tree, schema: any) {
	const serviceRoot = readProjectConfiguration(tree, "infra-shared").root;
	logger.info(`Generating listener files in ${serviceRoot}`);
	//cammelCase to kebab-case
	schema.queueName = schema.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
	logger.log({ queueName: schema.queueName });
	schema.name = `${schema.entity}${schema.name.split("").map((char, idx) => idx == 0 ? char.toUpperCase() : char).join("")}`;
	generateFiles(tree, joinPathFragments(__dirname, './files'), serviceRoot, schema);
	await formatFiles(tree);

	const serverlessPath = `${serviceRoot}/serverless.yml`;
	logger.info(`Updating ${serverlessPath}`);
	const serverlessContent = tree.read(serverlessPath);
	const queuePath = `./resources/sqs/${schema.service}/${schema.queueName}.yml`;
	if (serverlessContent) {
		const serverlessContentString = serverlessContent.toString();
		let updatedContent = serverlessContentString;


		const queueContent = `\${file(./resources/sqs/${schema.service}/${schema.queueName}.yml)}`;
		if (serverlessContent.indexOf(queueContent) === -1) {
			updatedContent = updatedContent.replace('resources:', `resources:
  - ${queueContent}`);

		}
		tree.write(serverlessPath, updatedContent);
		logger.info(`Updated ${serverlessPath}`);
	} else {
		logger.warn(`sqs already exists in ${serverlessPath}`);
	}
	logger.warn(`Don't forget to include Events on queue FilterPolicy inside the ${queuePath} file.`);
}