const getTenant = async (dynamoDB: any, tenantName: any) => {
  const params = {
    TableName: `${process.env.TABLE_MAIN}`,
    KeyConditionExpression: " #pk = :pk and #sk = :sk",
    ExpressionAttributeValues: {
      ":pk": "tenant",
      ":sk": `tenant::${tenantName}`
    },
    ExpressionAttributeNames: {
      "#pk": "pk",
      "#sk": "sk"
    }
  };
  const result = await dynamoDB.query(params).promise();
  if (result.Items && result.Items.length > 0) {
    return result.Items[0];
  }
  throw new Error("No tenant found");
};

export {
  getTenant
};
