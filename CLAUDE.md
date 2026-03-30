# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aussie Property Tracker is a portfolio project — a real-time property alert system for the Australian market. It is an event-driven serverless application: React frontend, AWS Lambda backend, DynamoDB, API Gateway (REST + WebSocket), SNS (sandbox mode for SMS OTP), EventBridge, and AWS CDK for infrastructure. AWS region: `ap-southeast-2` (Sydney). Designed for ~$0/month AWS cost using mock data and SNS sandbox.

## Commands

Frontend (`frontend/`):
```bash
npm run dev          # Vite dev server on port 3000
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint (--max-warnings 0, strict)
npm run type-check   # tsc --noEmit
npm run preview      # Preview production build
```

Backend (`backend/`):
```bash
npm run build        # esbuild bundle for Lambda (Node 20, externalises AWS SDK)
npm run type-check   # TypeScript type checking
npm run test         # Jest with experimental VM modules
npm run lint         # ESLint TypeScript rules
```

No monorepo root scripts — run commands from within `frontend/` or `backend/`.

## Architecture

### Data Flow

```
React (S3 + CloudFront)
  ├─ REST (axios)   → API Gateway REST  → Lambda functions
  └─ WebSocket      → API Gateway WS   → Lambda functions
                                              ↓
                                         DynamoDB (on-demand)
                                              ↓
                                    EventBridge (cron every 5 min)
                                         → mock-listings Lambda
                                         → push-lambda (WS broadcast)
```

### Lambda Functions (5 total, in `backend/src/functions/`)

| Function | Trigger | Responsibility |
|---|---|---|
| `otp-request` | REST POST | Hash OTP with bcryptjs, store in DynamoDB (TTL), send via SNS SMS |
| `otp-verify` | REST POST | Validate OTP, issue JWT |
| `ws-connect` | WS `$connect`/`$disconnect` | Track active WebSocket connections in DynamoDB |
| `mock-listings` | EventBridge cron (5 min) | Generate mock property listings, write to DynamoDB |
| `push-lambda` | DynamoDB stream / internal | Broadcast new listings to all connected WS clients |

### Frontend Structure (`frontend/src/`)

- **`config/aws.ts`** — `AWS_CONFIG` object with `apiUrl` and `wsUrl` from environment variables
- **`hooks/useAuthStore.ts`** — Module-level state + listeners pattern (no Redux); stores JWT and phone in `sessionStorage`
- **`hooks/useWebSocket.ts`** — WebSocket manager with exponential backoff (1s→16s, max 5 retries), 30s ping interval; dispatches `listing_alert`, `report_ready`, `pong` messages
- **`api/`** — `auth.ts`, `subscriptions.ts`, `reports.ts` — thin axios wrappers; authenticated calls use Bearer token
- **`utils/mockData.ts`** — Mock listings, subscriptions, reports for local development
- **`utils/format.ts`** — Price formatting, relative time, AU phone normalisation
- **Pages** — All currently placeholder components awaiting implementation

### Environment Variables

Frontend requires a `.env` file (see `.env.example`):
```
VITE_API_URL=https://YOUR_API_ID.execute-api.ap-southeast-2.amazonaws.com/prod
VITE_WS_URL=wss://YOUR_WS_ID.execute-api.ap-southeast-2.amazonaws.com/prod
```

### Styling

Tailwind CSS 3 with dark theme. Key custom tokens: `surface-900/800/700/600` for backgrounds, `brand` for green accent (`#10b981`). Custom animations: `slide-in`, `fade-up`, `pulse-brand`, `toast-in`. Custom fonts: Syne (display), DM Sans (body), DM Mono (mono). Glass-morphism via `glass-strong` utility class.

### Infrastructure

CDK code lives in `infra/` (TypeScript). Currently incomplete. DynamoDB tables use on-demand billing. SNS is in sandbox mode (no real SMS costs).

## Development Status

- Frontend pages are stubs (`LoginPage`, `OTPPage`, `DashboardPage`, `SubscriptionsPage`, `ReportsPage`)
- Backend Lambda function directories exist but implementations are empty
- CDK stacks in `infra/lib/` are not yet written
- CI/CD workflows in `.github/workflows/` are not yet configured
