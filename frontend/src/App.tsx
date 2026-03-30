import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage }        from '@/pages/LoginPage'
import { OTPPage }          from '@/pages/OTPPage'
import { DashboardPage }    from '@/pages/DashboardPage'
import { SubscriptionsPage} from '@/pages/SubscriptionsPage'
import { ReportsPage }      from '@/pages/ReportsPage'
import { useAuthStore }     from '@/hooks/useAuthStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/otp"    element={<OTPPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Routes>
              <Route path="/"             element={<DashboardPage />} />
              <Route path="/subscriptions"element={<SubscriptionsPage />} />
              <Route path="/reports"      element={<ReportsPage />} />
            </Routes>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
