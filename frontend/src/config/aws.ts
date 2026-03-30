// All AWS endpoints come from environment variables
// Copy .env.example → .env.local and fill in your values after CDK deploy

export const AWS_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  wsUrl:  import.meta.env.VITE_WS_URL  ?? 'ws://localhost:4001',
  region: 'ap-southeast-2',
} as const
