import { AWS_CONFIG } from '@/config/aws'
import { Subscription, NewSubscription } from '@/types'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('apt_token')}`,
  }
}

async function req(path: string, options?: RequestInit) {
  const res = await fetch(`${AWS_CONFIG.apiUrl}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const getSubscriptions   = (): Promise<{ subscriptions: Subscription[] }> =>
  req('/subscriptions')

export const addSubscription    = (data: NewSubscription): Promise<{ subscriptionId: string }> =>
  req('/subscriptions', { method: 'POST', body: JSON.stringify(data) })

export const deleteSubscription = (id: string): Promise<{ deleted: boolean }> =>
  req(`/subscriptions/${id}`, { method: 'DELETE' })

export const toggleSubscription = (id: string, active: boolean): Promise<Subscription> =>
  req(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) })
