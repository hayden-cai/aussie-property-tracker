# 🏠 Aussie Property Tracker

Real-time property alert system for the Australian market.  
Built with AWS Serverless (Lambda, DynamoDB, API Gateway WebSocket, EventBridge, SNS) + React + TypeScript + Tailwind CSS.

> **Portfolio project** — uses mock property data and SNS sandbox mode. ~$0/month AWS cost.

## Architecture

```
React (S3 + CloudFront)
    ↓  REST + WebSocket
API Gateway
    ↓
Lambda Functions (5)
├── otp-request    → DynamoDB + SNS sandbox SMS
├── otp-verify     → JWT issuance
├── ws-connect     → DynamoDB connection store
├── mock-listings  → EventBridge every 5 min
└── push-lambda    → WebSocket push to clients

EventBridge → DynamoDB → S3
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite |
| Backend | AWS Lambda · Node.js 20 · TypeScript |
| Database | AWS DynamoDB (on-demand) |
| Messaging | AWS SNS (sandbox) · API Gateway WebSocket |
| Scheduler | AWS EventBridge |
| Storage | AWS S3 + CloudFront |
| IaC | AWS CDK (TypeScript) |
| CI/CD | GitHub Actions |

## Project Structure

```
aussie-property-tracker/
├── frontend/          # React + Tailwind app
├── backend/           # Lambda functions
├── infra/             # AWS CDK stacks
├── .github/workflows/ # CI/CD pipeline
└── docs/              # Architecture notes
```

## Getting Started

See [docs/setup.md](docs/setup.md) for full setup instructions.

## Resume

- Architected event-driven serverless system: API Gateway WebSocket + Lambda + EventBridge + DynamoDB + SNS
- Implemented phone OTP auth with bcrypt hashing, DynamoDB TTL auto-expiry, and JWT session management
- Built real-time property alerts via WebSocket push with automatic reconnection + exponential backoff
- Deployed all infrastructure as code with AWS CDK (TypeScript) across 4 stacks
- CI/CD pipeline via GitHub Actions: lint → build → cdk deploy → S3 sync
