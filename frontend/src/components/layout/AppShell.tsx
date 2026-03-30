// Main layout wrapper used by all authenticated pages
// Contains: top navbar, left sidebar, right event feed, main content slot

interface AppShellProps {
  children: React.ReactNode
  activeTab?: 'dashboard' | 'subscriptions' | 'reports'
}

export function AppShell({ children, activeTab }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* TODO: add TopNav, Sidebar, EventFeed */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
