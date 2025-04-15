const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const logger = require('./logger');

const ssmClient = new SSMClient();

async function getConfig() {
  try {
    // Fetch AWS region from environment (optional, can hardcode if needed)
    logger.info('Fetching AWS_REGION from environment');
    const awsRegion = process.env.AWS_REGION;
    if (!awsRegion) throw new Error('AWS_REGION not set');
    logger.info('AWS region fetched successfully', { awsRegion });

    // Fetch Parameter Store path environment variables
    logger.info('Fetching Parameter Store path environment variables');
    const paramJwtSecretPath = process.env.PARAM_JWT_SECRET_PATH;

    if (!paramJwtSecretPath) {
      throw new Error('Missing required environment variable: PARAM_JWT_SECRET_PATH');
    }
    logger.info('Parameter Store path environment variables validated', {
      paramJwtSecretPath,
    });

    // Fetch JWT secret from Parameter Store with decryption
    const getParam = async (name) => {
      logger.info('Fetching parameter from Parameter Store', { name });
      const { Parameter } = await ssmClient.send(
        new GetParameterCommand({ Name: name, WithDecryption: true })
      );
      return Parameter.Value;
    };

    logger.info('Fetching jwtSecret from Parameter Store');
    const jwtSecret = await getParam(paramJwtSecretPath);

    logger.info('Configuration loaded successfully');
    return {
      awsRegion,
      jwtSecret,
      port: process.env.PORT || 3000,
    };
  } catch (err) {
    logger.error('Failed to load configuration', { error: err.message, stack: err.stack });
    throw err;
  }
}

module.exports = getConfig;