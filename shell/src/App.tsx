import { Routes, Route, NavLink } from 'react-router-dom'
import LoanDashboard from './microfrontends/LoanDashboard'
import LoanDetail from './microfrontends/LoanDetail'
import AnalyticsPanel from './microfrontends/AnalyticsPanel'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🏦</span>
          <span className="logo-text">Fioneer Credit Workspace</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Loans
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Analytics
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LoanDashboard />} />
          <Route path="/loans/:id" element={<LoanDetail />} />
          <Route path="/analytics" element={<AnalyticsPanel />} />
        </Routes>
      </main>
    </div>
  )
}
