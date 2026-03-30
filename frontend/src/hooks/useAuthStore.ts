import { useState, useCallback } from 'react'

// Simple module-level state (no Redux needed for portfolio project)
let _token: string | null = null
let _phone: string | null = null

const listeners = new Set<() => void>()
function notify() { listeners.forEach(fn => fn()) }

export function useAuthStore() {
  const [, forceRender] = useState(0)

  const subscribe = useCallback(() => {
    const fn = () => forceRender(n => n + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  // subscribe on mount
  useState(subscribe)

  return {
    token: _token,
    phone: _phone,
    setAuth(token: string, phone: string) {
      _token = token
      _phone = phone
      sessionStorage.setItem('apt_token', token)
      sessionStorage.setItem('apt_phone', phone)
      notify()
    },
    setPhone(phone: string) {
      _phone = phone
      notify()
    },
    logout() {
      _token = null
      _phone = null
      sessionStorage.clear()
      notify()
    },
    // Restore from sessionStorage on page refresh
    init() {
      _token = sessionStorage.getItem('apt_token')
      _phone = sessionStorage.getItem('apt_phone')
      notify()
    },
  }
}
