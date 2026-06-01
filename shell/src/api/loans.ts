import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:8000' })

export interface Loan {
  id: string
  borrower: string
  property_address: string
  loan_amount: number
  interest_rate: number
  stage: 'APPLICATION' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'CLOSED'
  created_at: string
  updated_at: string
}

export interface AnalyticsSummary {
  total_loans: number
  total_portfolio_value: number
  average_interest_rate: number
  by_stage: Record<string, { count: number; total_value: number }>
}

export const loansApi = {
  getAll: (stage?: string, search?: string) =>
    API.get<Loan[]>('/loans', { params: { stage, search } }).then(r => r.data),

  getOne: (id: string) =>
    API.get<Loan>(`/loans/${id}`).then(r => r.data),

  create: (data: { borrower: string; property_address: string; loan_amount: number; interest_rate: number }) =>
    API.post<Loan>('/loans', data).then(r => r.data),

  updateStage: (id: string, stage: string) =>
    API.patch<Loan>(`/loans/${id}/stage`, { stage }).then(r => r.data),

  getSummary: () =>
    API.get<AnalyticsSummary>('/analytics/summary').then(r => r.data),
}
