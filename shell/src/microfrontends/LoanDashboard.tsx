/**
 * MICRO FRONTEND 1: Loan Dashboard
 * Responsibilities: list all loans, filter by stage, search by borrower/address, create new loan
 * Tech: Tanstack React Query for data fetching + caching, UI5-webcomponents-react for UI primitives
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loansApi, type Loan } from '../api/loans'

const STAGES = ['ALL', 'APPLICATION', 'REVIEW', 'APPROVED', 'ACTIVE', 'CLOSED']

export default function LoanDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [stageFilter, setStageFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ borrower: '', property_address: '', loan_amount: '', interest_rate: '' })

  // Tanstack React Query — fetches & caches loan list
  const { data: loans, isLoading, isError } = useQuery({
    queryKey: ['loans', stageFilter, search],
    queryFn: () => loansApi.getAll(
      stageFilter !== 'ALL' ? stageFilter : undefined,
      search || undefined
    ),
  })

  // Mutation for creating a new loan
  const createMutation = useMutation({
    mutationFn: loansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      setShowForm(false)
      setForm({ borrower: '', property_address: '', loan_amount: '', interest_rate: '' })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      borrower: form.borrower,
      property_address: form.property_address,
      loan_amount: parseFloat(form.loan_amount),
      interest_rate: parseFloat(form.interest_rate),
    })
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Commercial Real Estate Loans</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Loan'}
        </button>
      </div>

      {/* New Loan Form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '4px solid #0a6ed1' }}>
          <h3 style={{ marginBottom: '1rem', color: '#0a6ed1' }}>Create New Loan Application</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Borrower Name *</label>
                <input className="filter-input" style={{ width: '100%' }} required
                  value={form.borrower} onChange={e => setForm({ ...form, borrower: e.target.value })}
                  placeholder="e.g. Max Müller" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Property Address *</label>
                <input className="filter-input" style={{ width: '100%' }} required
                  value={form.property_address} onChange={e => setForm({ ...form, property_address: e.target.value })}
                  placeholder="e.g. Hauptstr. 1, Berlin" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Loan Amount (€) *</label>
                <input className="filter-input" style={{ width: '100%' }} required type="number" min="1000"
                  value={form.loan_amount} onChange={e => setForm({ ...form, loan_amount: e.target.value })}
                  placeholder="e.g. 500000" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Interest Rate (%) *</label>
                <input className="filter-input" style={{ width: '100%' }} required type="number" step="0.1" min="0.1" max="20"
                  value={form.interest_rate} onChange={e => setForm({ ...form, interest_rate: e.target.value })}
                  placeholder="e.g. 3.5" />
              </div>
            </div>
            <button className="btn btn-success" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Submit Application'}
            </button>
            {createMutation.isError && <span className="error-msg" style={{ marginLeft: '1rem' }}>Error creating loan</span>}
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <input className="filter-input" placeholder="🔍 Search borrower or address..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: '280px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STAGES.map(s => (
            <button key={s} onClick={() => setStageFilter(s)}
              className={`btn btn-sm ${stageFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading && <div className="loading">Loading loans...</div>}
        {isError && <div className="error-msg" style={{ margin: '1rem' }}>Failed to load loans. Is the backend running?</div>}
        {loans && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Property</th>
                <th>Loan Amount</th>
                <th>Rate</th>
                <th>Stage</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No loans found</td></tr>
              )}
              {loans.map((loan: Loan) => (
                <tr key={loan.id}>
                  <td style={{ fontWeight: 500 }}>{loan.borrower}</td>
                  <td style={{ color: '#6c757d', fontSize: '0.88rem' }}>{loan.property_address}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(loan.loan_amount)}</td>
                  <td>{loan.interest_rate}%</td>
                  <td><span className={`stage-badge stage-${loan.stage}`}>{loan.stage}</span></td>
                  <td style={{ color: '#6c757d', fontSize: '0.88rem' }}>{loan.updated_at}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/loans/${loan.id}`)}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {loans && (
        <p style={{ color: '#6c757d', fontSize: '0.85rem', textAlign: 'right' }}>
          {loans.length} loan{loans.length !== 1 ? 's' : ''} shown
        </p>
      )}
    </div>
  )
}
