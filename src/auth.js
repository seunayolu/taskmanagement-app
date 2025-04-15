const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('./logger');
// Import PutCommand and GetCommand
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

async function signup(req) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Use DynamoDB to create a new user
    const params = {
      TableName: 'TaskManagementUsers',
      Item: {
        email, // Partition key
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(email)', // Prevent overwriting existing users
    };

    await req.db.send(new PutCommand(params));
    logger.info('User created in DynamoDB', { email });
    return { email, message: 'User created successfully' };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      logger.warn('Signup attempt with existing email', { email });
      throw new Error('Email already exists');
    }
    logger.error('Failed to create user in DynamoDB', { error: err.message, email });
    throw new Error('Failed to create user: ' + err.message);
  }
}

async function login(req) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Use DynamoDB to get the user by email
    const params = {
      TableName: 'TaskManagementUsers',
      Key: { email },
    };

    const { Item: user } = await req.db.send(new GetCommand(params));
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      throw new Error('Email not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.warn('Login attempt with incorrect password', { email });
      throw new Error('Incorrect password');
    }

    const token = jwt.sign({ email }, req.jwtSecret, { expiresIn: '1h' });
    logger.info('JWT token generated', { email });
    return { token };
  } catch (err) {
    logger.error('Failed to login user from DynamoDB', { error: err.message, email });
    throw new Error('Failed to login: ' + err.message);
  }
}

async function verifyToken(req) {
  const { token } = req.body;
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, req.jwtSecret);
    logger.info('Token verified', { email: decoded.email });
    return { valid: true, email: decoded.email };
  } catch (err) {
    logger.warn('Invalid token verification attempt', { error: err.message });
    throw new Error('Invalid token');
  }
}

module.exports = { signup, login, verifyToken };