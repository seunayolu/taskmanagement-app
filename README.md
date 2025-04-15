# Task Management Application

## Overview

This is a full-stack task management application designed to allow users to sign up, log in, and manage tasks securely. The application is split into two main services:

- **Auth Service**: Handles user authentication (signup, login, token verification) using JSON Web Tokens (JWT).
- **Frontend**: A React-based single-page application (SPA) for user interaction, hosted at `https://frontend.classof25.online`.

The project has been updated to use **TypeScript** for improved type safety and developer experience. The backend now uses **DynamoDB** as the database for storing user data, replacing the previous PostgreSQL RDS setup.

### Architecture
- **Backend (Auth Service)**:
  - Built with Node.js, Express, and TypeScript.
  - Deployed on AWS ECS (Fargate) in private subnets.
  - Uses an Application Load Balancer (ALB) at `https://auth.teachdev.online` for routing traffic (HTTPS on port 443).
  - Stores user data in DynamoDB.
  - Logs are sent to CloudWatch under the log group `/ecs/task-management-auth`.
- **Frontend**:
  - Built with React, TypeScript, and Vite.
  - Hosted on AWS Amplify at `https://frontend.classof25.online`.
  - Communicates with the Auth Service via API calls to `https://auth.teachdev.online`.
- **Networking**:
  - The ALB is in public subnets.
  - Security groups:
    - ALB: `task-management-alb-sg` (allows HTTPS on port 443 from `0.0.0.0/0`).
    - ECS Service security group (allows inbound traffic on port 3000 from the ALB security group).

## Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **AWS CLI**: Configured with credentials for your AWS account
- **Docker**: For building and deploying the Auth Service
- **AWS Account**: With access to ECS, ECR, ALB, DynamoDB, and CloudWatch
- **AWS Amplify**: For deploying the frontend

## Project Structure

```
task-management/
├── services/
│   └── auth/
│       ├── src/
|       |   |── middleware/
|       |   |   └── configMiddleware.js # Manages DB and JWT connection
│       │   ├── index.js                # Entry point for the Auth Service
│       │   ├── auth.js                 # Authentication logic
│       │   ├── config.js               # Configuration loader
│       │   ├── db.js                   # DynamoDB client setup
│       │   └── logger.js               # Logger configuration for CloudWatch
│       ├── Dockerfile                  # Docker configuration for the Auth Service
│       ├── package.json                # Backend dependencies
│       
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AuthForm.tsx            # Component for testing signup/login
|   |   ├── api/
|   |   |   └── auth.ts                 # Manage frontend api call
|   |   ├── pages/
|   |   |   └── Login.tsx               # Manage Login workflow
|   |   |   └── Signup.tsx              # Manage Signup workflow
|   |   |   └── Dashboard.tsx           # Task Management Dashboard
│   │   ├── main.tsx                    # Backend Entry point
|   |   ├── index.css                   # Styling
|   |   ├── vite-env.d.ts         
│   │   └── App.tsx                     # Component for routing
│   ├── index.html                      
|   ├── eslint.config.js
|   ├── postcss.config.js
|   ├── tailwind.config.js
|   ├── tsconfig.app.json
|   ├── tsconfig.node.json
|   ├── vite.config.ts          
│   ├── package.json                    # Frontend dependencies
│   └── tsconfig.json                   # TypeScript configuration
└── README.md                           # Project documentation
```

## Setup Instructions

### Backend (Auth Service)

1. **Navigate to the Auth Service Directory**:
   ```bash
   cd services/auth
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up AWS SSM Parameters**:
   - Store the following parameters in AWS SSM Parameter Store:
     - `/task-management/auth/jwt-secret`: `<your-jwt-secret>`
   - Example command to create a parameter:
     ```bash
     aws ssm put-parameter \
       --name "/task-management/auth/jwt-secret" \
       --value "your-secret-key" \
       --type SecureString \
       --region eu-west-3
     ```

4. **Create the DynamoDB Table**:
   - Create a DynamoDB table named `task-management-users` with:
     - Partition key: `email` (String)
     - Example command:
       ```bash
       aws dynamodb create-table \
         --table-name task-management-users \
         --attribute-definitions AttributeName=email,AttributeType=S \
         --key-schema AttributeName=email,KeyType=HASH \
         --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
         --region eu-west-3
       ```

5. **Build and Deploy the Auth Service**:
   - Build the Docker image:
     ```bash
     docker build -t task-management-auth .
     ```
   - Push to AWS ECR:
     ```bash
     docker tag task-management-auth:latest <account-id>.dkr.ecr.eu-west-3.amazonaws.com/task-management-auth:latest
     docker push <account-id>.dkr.ecr.eu-west-3.amazonaws.com/task-management-auth:latest
     ```
   - Update the ECS service:
     ```bash
     aws ecs update-service \
       --cluster task-management-cluster \
       --service auth-service \
       --force-new-deployment \
       --region eu-west-3
     ```

6. **Verify Deployment**:
   - Check the health endpoint:
     ```bash
     curl https://auth.teachdev.online/health
     ```
   - Expected response:
     ```json
     {"status":"healthy"}
     ```

### Frontend

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Setup environment variable in Amplify
     ```env
     VITE_API_BASE_URL=https://auth.teachdev.online
     ```

4. **Run Locally**:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:5173` to test locally.

5. **Deploy to Amplify**:
   - Push the code to a GitHub repository.
   - In Amplify, create a new app and connect your repository.
   - Set the following environment variable in Amplify:
     - Key: `VITE_API_BASE_URL`
     - Value: `https://auth.teachdev.online`
   - Create app: Note: Amplify run `npm run build` automatically
   - Deploy the site and set the custom domain to `frontend.classof25.online`.

## Usage

1. **Sign Up**:
   - Navigate to `https://frontend.classof25.online`.
   - Enter your email (e.g., `user@example.com`) and password (e.g., `SecurePass123`).
   - Click “Sign Up”.
   - Expected response: A success message indicating the user was created.

2. **Log In**:
   - On the same page, enter your email and password.
   - Click “Log In”.
   - Login Successful => Dashboard

## API Endpoints

- **Health Check**:
  - `GET /health`
  - Response: `{"status":"healthy"}`
- **Signup**:
  - `POST /auth/signup`
  - Body: `{"email": "user@example.com", "password": "SecurePass123"}`
  - Response: `{"userId": 1, "email": "user@example.com"}`
- **Login**:
  - `POST /auth/login`
  - Body: `{"email": "user@example.com", "password": "SecurePass123"}`
  - Response: `{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}`
- **Verify Token**:
  - `POST /auth/verify`
  - Body: `{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}`
  - Response: `{"valid": true, "userId": 1}`

## Troubleshooting

- **CORS Issues**:
  - Ensure the backend’s CORS configuration allows requests from `https://frontend.classof25.online`.
  - Check CloudWatch logs (`/ecs/task-management-auth`) for CORS-related errors.
- **DynamoDB Connection Issues**:
  - Verify the ECS task role has the necessary permissions (`dynamodb:PutItem`, `dynamodb:GetItem`, etc.) for the `task-management-users` table.
  - Check the VPC endpoint for DynamoDB if using private subnets.
- **Frontend Errors**:
  - Confirm `VITE_API_BASE_URL` is set correctly in your environment.
  - Check the browser’s Network tab for failed requests and corresponding error messages.

## Future Improvements

- **Task Service**: Implement the Task Service to manage tasks, integrating with the Auth Service for token verification.
- **Enhanced Security**: Add multi-factor authentication (MFA) and rate limiting to the Auth Service.
- **Frontend Features**: Add a dashboard to manage tasks once the Task Service is implemented.

## Contributing

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request with your changes.

## License

This project is licensed under the MIT License.