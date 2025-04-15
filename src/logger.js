const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    // Log to console (useful for CloudWatch)
    new winston.transports.Console(),
    // Optionally, log to a file for local debugging
    new winston.transports.File({ filename: 'logs/auth-service.log' })
  ],
});

module.exports = logger;