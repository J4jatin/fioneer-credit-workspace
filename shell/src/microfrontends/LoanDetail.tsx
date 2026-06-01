/**
 * MICRO FRONTEND 2: Loan Detail
 * Responsibilities: show full loan details, visualize lifecycle pipeline,
 *                   allow stage transitions with validation
 * Tech: Tanstack React Query (single loan fetch + mutation), React Router params
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { loansApi } from '../api/loans'

const STAGE_ORDER = ['APPLICATION', 'REVIEW', 'APPROVED', 'ACTIVE', 'CLOSED']

const STAGE_TRANSITIONS: Record<string, string[]> = {
  APPLICATION: ['REVIEW'],
  REVIEW: ['APPROVED', 'APPLICATION'],
  APPROVED: ['ACTIVE', 'REVIEW'],
  ACTIVE: ['CLOSED'],
  CLOSED: [],
}

const STAGE_LABELS: Record<string, string> = {
  APPLICATION: '📋 Application',
  REVIEW: '🔍 Review',
  APPROVED: '✅ Approved',
  ACTIVE: '🏠 Active',
  CLOSED: '🔒 Closed',
}

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: loan, isLoading, isError } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => loansApi.getOne(id!),
    enabled: !!id,
  })

  const stageMutation = useMutation({
    mutationFn: (newStage: string) => loansApi.updateStage(id!, newStage),
    onSuccess: (updated) => {
      // Update both the individual loan cache and the list cache
      queryClient.setQueryData(['loan', id], updated)
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)

  if (isLoading) return <div className="loading">Loading loan details...</div>
  if (isError || !loan) return (
    <div>
      <div className="error-msg">Loan not found or backend is not running.</div>
      <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back to Loans</button>
    </div>
  )

  const currentIdx = STAGE_ORDER.indexOf(loan.stage)
  const allowedTransitions = STAGE_TRANSITIONS[loan.stage] || []

  return (
    <div>
      {/* Back nav */}
      <button className="btn btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/')}>
        ← Back to Loans
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{loan.borrower}</h1>
          <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{loan.property_address}</p>
        </div>
        <span className={`stage-badge stage-${loan.stage}`} style={{ fontSize: '0.9rem', padding: '5px 14px' }}>
          {loan.stage}
        </span>
      </div>

      {/* Lifecycle Pipeline */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#1c2b33', fontSize: '1rem' }}>Loan Lifecycle</h3>
        <div className="stage-pipeline">
          {STAGE_ORDER.map((stage, idx) => (
            <div
              key={stage}
              className={`pipeline-step ${idx < currentIdx ? 'done' : ''} ${stage === loan.stage ? 'current' : ''}`}
            >
              {STAGE_LABELS[stage]}
              {idx < currentIdx && <div style={{ fontSize: '0.7rem', color: '#28a745' }}>✓ Done</div>}
              {stage === loan.stage && <div style={{ fontSize: '0.7rem', color: '#0a6ed1' }}>● Current</div>}
            </div>
          ))}
        </div>

        {/* Stage transition buttons */}
        {allowedTransitions.length > 0 && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.75rem' }}>Move to next stage:</p>
            <div className="stage-actions">
              {allowedTransitions.map(target => (
                <button
                  key={target}
                  className={`btn ${target === 'CLOSED' || STAGE_ORDER.indexOf(target) < currentIdx ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={stageMutation.isPending}
                  onClick={() => stageMutation.mutate(target)}
                >
                  {stageMutation.isPending ? 'Updating...' : `→ Move to ${target}`}
                </button>
              ))}
            </div>
            {stageMutation.isError && (
              <p className="error-msg" style={{ marginTop: '0.75rem' }}>Stage transition failed</p>
            )}
            {stageMutation.isSuccess && (
              <p style={{ color: '#28a745', fontSize: '0.85rem', marginTop: '0.5rem' }}>✓ Stage updated successfully</p>
            )}
          </div>
        )}
        {loan.stage === 'CLOSED' && (
          <p style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '0.5rem' }}>This loan is closed. No further transitions possible.</p>
        )}
      </div>

      {/* Loan Details */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#1c2b33', fontSize: '1rem' }}>Loan Details</h3>
        <div className="detail-grid">
          <div className="detail-field">
            <label>Loan ID</label>
            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{loan.id}</span>
          </div>
          <div className="detail-field">
            <label>Loan Amount</label>
            <span style={{ fontSize: '1.3rem', color: '#0a6ed1' }}>{formatCurrency(loan.loan_amount)}</span>
          </div>
          <div className="detail-field">
            <label>Interest Rate</label>
            <span>{loan.interest_rate}% per annum</span>
          </div>
          <div className="detail-field">
            <label>Monthly Payment (est.)</label>
            <span>
              {formatCurrency(
                (loan.loan_amount * (loan.interest_rate / 100 / 12)) /
                (1 - Math.pow(1 + loan.interest_rate / 100 / 12, -360))
              )} / month
            </span>
          </div>
          <div className="detail-field">
            <label>Application Date</label>
            <span>{loan.created_at}</span>
          </div>
          <div className="detail-field">
            <label>Last Updated</label>
            <span>{loan.updated_at}</span>
          </div>
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label>Property Address</label>
            <span>{loan.property_address}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
