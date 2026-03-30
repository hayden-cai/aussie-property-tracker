import { AWS_CONFIG } from '@/config/aws'

async function post(path: string, body: object) {
  const res = await fetch(`${AWS_CONFIG.apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json()
}

/** Step 1 — send OTP to phone number via SNS */
export async function requestOTP(phone: string): Promise<{ message: string }> {
  return post('/auth/request-otp', { phone })
}

/** Step 2 — verify OTP, returns JWT */
export async function verifyOTP(phone: string, code: string): Promise<{ token: string }> {
  return post('/auth/verify-otp', { phone, code })
}
