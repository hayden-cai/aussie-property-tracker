import { AWS_CONFIG } from '@/config/aws'
import { Report, ReportFormat } from '@/types'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('apt_token')}`,
  }
}

export interface GenerateReportOptions {
  type:     string
  dateFrom: string
  dateTo:   string
  format:   ReportFormat
}

/** Fire-and-forget — actual URL arrives via WebSocket 'report_ready' event */
export const generateReport = (opts: GenerateReportOptions): Promise<{ reportId: string; status: 'processing' }> =>
  fetch(`${AWS_CONFIG.apiUrl}/reports/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(opts),
  }).then(r => r.json())

export const getReports = (): Promise<{ reports: Report[] }> =>
  fetch(`${AWS_CONFIG.apiUrl}/reports`, { headers: authHeaders() }).then(r => r.json())
