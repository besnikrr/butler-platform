const AWS = require('aws-sdk');
var cloudformation = new AWS.CloudFormation({
  region: 'us-east-1'
});
const s3 = new AWS.S3({
  region: 'us-east-1'
});
var cloudwatchlogs = new AWS.CloudWatchLogs({
  region: 'us-east-1'
});
const logGroupPrefix = "/aws/lambda/"
const stacks = {
  "voucher-dev": "voucher-dev-serverlessdeploymentbucket",
  "network-dev": "network-dev-serverlessdeploymentbucket",
  "menu-dev": "menu-dev-serverlessdeploymentbucket",
  "discount-dev": "discount-dev-serverlessdeploymentbucket",
  "iam-dev": "iam-dev-serverlessdeploymentbucket",
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const deleteBucket = async Bucket => {
  try {
    console.log(`Deleting ${Bucket}`);
    // We can't delete a bucket before emptying its contents
    const { Contents } = await s3.listObjects({ Bucket }).promise();
    if (Contents.length > 0) {
      await s3
        .deleteObjects({
          Bucket,
          Delete: {
            Objects: Contents.map(({ Key }) => ({ Key }))
          }
        })
        .promise();
    }
    await s3.deleteBucket({ Bucket }).promise();
    return true;
  } catch (err) {
    console.log("\n", err, "\n");
    return false;
  }
};

const deleteLogs = async (groupPrefix) => {
  const { logGroups } = await cloudwatchlogs.describeLogGroups({
    logGroupNamePrefix: groupPrefix
  }).promise()
  for (loggroup of logGroups) {
    await delay(200);
    await cloudwatchlogs.deleteLogGroup({
      logGroupName: loggroup.logGroupName
    }).promise()
  }
}

(async () => {
  const { Buckets } = await s3.listBuckets().promise();
  const choices = Buckets.map(({ Name }) => ({ name: Name, value: Name }));

  let deletedBuckets = 0;
  for (choice of choices) {
    for (bucket of Object.values(stacks)) {
      if (choice.name.startsWith(bucket)) {
        await delay(200);
        const isDeleted = await deleteBucket(choice.name);
        deletedBuckets += isDeleted ? 1 : 0;
      }
    }
  }
  console.log(
    `\nDeleted ${deletedBuckets} buckets.\n`
  );

  for (stackName of Object.keys(stacks)) {
    await deleteLogs(`${logGroupPrefix}${stackName}`)

    cloudformation.deleteStack({
      StackName: stackName
    }, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  }
})()


