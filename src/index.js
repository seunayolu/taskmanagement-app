const express = require('express');
const cors = require('cors');
const { signup, login, verifyToken } = require('./auth');
const getConfig = require('./config');
const configMiddleware = require('./middleware/configMiddleware');
const logger = require('./logger');

console.log('Starting index.js...');

const app = express();

// Enable CORS with explicit OPTIONS handling
app.use(cors({
  origin: 'https://frontend.classof25.online',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors({
  origin: 'https://frontend.classof25.online',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({ status: 'healthy' });
});

// Apply middleware to all routes except /health
app.use(configMiddleware);

app.post('/auth/signup', async (req, res) => {
  try {
    const result = await signup(req);
    logger.info('User signed up successfully', { email: req.body.email });
    res.status(201).json(result);
  } catch (err) {
    logger.error('Signup failed', { error: err.message, email: req.body.email });
    res.status(400).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const result = await login(req);
    logger.info('User logged in successfully', { email: req.body.email });
    res.json(result);
  } catch (err) {
    logger.error('Login failed', { error: err.message, email: req.body.email });
    res.status(401).json({ error: err.message });
  }
});

app.post('/auth/verify', async (req, res) => {
  try {
    const result = await verifyToken(req);
    logger.info('Token verified successfully', { email: result.email });
    res.json(result);
  } catch (err) {
    logger.error('Token verification failed', { error: err.message });
    res.status(401).json({ error: err.message });
  }
});

async function startServer() {
  logger.info('Fetching configuration...');
  const config = await getConfig();
  logger.info('Configuration fetched successfully', { port: config.port });

  logger.info(`Auth Service starting on port ${config.port}`);
  app.listen(config.port, () => {
    logger.info(`Auth Service running on port ${config.port}`);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});