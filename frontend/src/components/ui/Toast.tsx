// WebSocket-driven toast notifications
interface ToastProps {
  message:     string
  downloadUrl?: string
  onClose:     () => void
}

export function Toast({ message, downloadUrl, onClose }: ToastProps) {
  return (
    <div className="glass-strong rounded-2xl px-5 py-3.5 flex items-center gap-4 animate-toast-in"
         style={{ border: '1px solid #10b981', boxShadow: '0 8px 40px rgba(16,185,129,0.2)' }}>
      <div className="ws-dot" />
      <span className="text-sm text-brand-faint">{message}</span>
      {downloadUrl && (
        <a href={downloadUrl} target="_blank" rel="noreferrer"
           className="text-sm font-semibold text-brand-DEFAULT underline">
          Download
        </a>
      )}
      <button onClick={onClose} className="text-muted text-lg leading-none pl-2">×</button>
    </div>
  )
}
