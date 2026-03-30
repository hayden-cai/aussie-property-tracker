import { useEffect, useRef, useCallback } from 'react'
import { AWS_CONFIG } from '@/config/aws'
import { WSMessage } from '@/types'

export type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

interface Options {
  onMessage:    (msg: WSMessage) => void
  onStatusChange?: (status: WSStatus) => void
}

export function useWebSocket({ onMessage, onStatusChange }: Options) {
  const ws          = useRef<WebSocket | null>(null)
  const retries     = useRef(0)
  const maxRetries  = 5
  const pingTimer   = useRef<ReturnType<typeof setInterval>>()
  const isMounted   = useRef(true)

  const setStatus = useCallback((s: WSStatus) => onStatusChange?.(s), [onStatusChange])

  const connect = useCallback(() => {
    const token = sessionStorage.getItem('apt_token')
    if (!token || !isMounted.current) return

    setStatus(retries.current === 0 ? 'connecting' : 'reconnecting')
    const url = `${AWS_CONFIG.wsUrl}?token=${token}`

    try {
      ws.current = new WebSocket(url)
    } catch {
      setStatus('error')
      return
    }

    ws.current.onopen = () => {
      retries.current = 0
      setStatus('connected')
      // Keep-alive ping every 30 seconds
      pingTimer.current = setInterval(() => {
        ws.current?.readyState === WebSocket.OPEN &&
          ws.current.send(JSON.stringify({ action: 'ping' }))
      }, 30_000)
    }

    ws.current.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        onMessage(msg)
      } catch { /* malformed message — ignore */ }
    }

    ws.current.onerror = () => setStatus('reconnecting')

    ws.current.onclose = () => {
      clearInterval(pingTimer.current)
      if (!isMounted.current) return
      if (retries.current >= maxRetries) { setStatus('error'); return }
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1_000 * 2 ** retries.current, 30_000)
      retries.current++
      setTimeout(connect, delay)
    }
  }, [onMessage, setStatus])

  useEffect(() => {
    isMounted.current = true
    connect()
    return () => {
      isMounted.current = false
      clearInterval(pingTimer.current)
      ws.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  return { sendMessage }
}
