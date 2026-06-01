/**
 * MICRO FRONTEND 3: Analytics Panel
 * Responsibilities: portfolio-level KPIs, stage distribution chart, loan value breakdown
 * Tech: Tanstack React Query, Recharts (same lib used in Jattin's EV Battery project)
 */
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { loansApi } from '../api/loans'

const STAGE_COLORS: Record<string, string> = {
  APPLICATION: '#0a6ed1',
  REVIEW: '#ffc107',
  APPROVED: '#17a2b8',
  ACTIVE: '#28a745',
  CLOSED: '#6c757d',
}

export default function AnalyticsPanel() {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: loansApi.getSummary,
    refetchInterval: 30_000, // auto-refresh every 30s
  })

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }).format(v)

  if (isLoading) return <div className="loading">Loading analytics...</div>
  if (isError || !summary) return <div className="error-msg">Failed to load analytics. Is the backend running?</div>

  const stageData = Object.entries(summary.by_stage).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.total_value,
  }))

  const pieData = stageData.filter(d => d.count > 0)

  return (
    <div>
      <h1 className="page-title">Portfolio Analytics</h1>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Loans</div>
          <div className="stat-value">{summary.total_loans}</div>
          <div className="stat-sub">across all stages</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#28a745' }}>
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">{formatCurrency(summary.total_portfolio_value)}</div>
          <div className="stat-sub">total loan amount</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ffc107' }}>
          <div className="stat-label">Avg Interest Rate</div>
          <div className="stat-value">{summary.average_interest_rate}%</div>
          <div className="stat-sub">weighted average</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#17a2b8' }}>
          <div className="stat-label">Active Loans</div>
          <div className="stat-value">{summary.by_stage['ACTIVE']?.count ?? 0}</div>
          <div className="stat-sub">{formatCurrency(summary.by_stage['ACTIVE']?.total_value ?? 0)} value</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Loans by Stage - Bar Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: '#1c2b33' }}>Loans by Stage</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, 'Loans']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stageData.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Value Distribution - Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: '#1c2b33' }}>Portfolio Value Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="stage"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ stage, percent }) => `${stage} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                ))}
              </Pie>
              <Legend formatter={(v) => v} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Value by Stage - Bar Chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: '#1c2b33' }}>Loan Value by Stage (€)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData} margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total Value']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stageData.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
