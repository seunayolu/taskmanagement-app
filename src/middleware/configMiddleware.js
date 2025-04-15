const { getPool } = require('../db');
const getConfig = require('../config');
const logger = require('../logger');

const configMiddleware = async (req, res, next) => {
  try {
    const config = await getConfig();
    req.db = await getPool(); // This now returns the DynamoDB client
    req.jwtSecret = config.jwtSecret;
    next();
  } catch (error) {
    logger.error('Failed to initialize configuration in middleware', { error: error.message });
    res.status(500).json({ error: 'Failed to initialize configuration' });
  }
};

module.exports = configMiddleware;