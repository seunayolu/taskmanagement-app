const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const getConfig = require('./config');
const logger = require('./logger');

let docClient;

async function initDb() {
  const config = await getConfig();

  const client = new DynamoDBClient({
    region: config.awsRegion || 'us-east-1',
  });

  docClient = DynamoDBDocumentClient.from(client);
  logger.info('DynamoDB client initialized successfully');

  return docClient;
}

module.exports = {
  getPool: async () => docClient || (await initDb()),
};