# Fioneer Credit Workspace

A cloud-native micro frontend application for managing the full lifecycle of **commercial real estate loans** — built with React 18, TypeScript, FastAPI, and Playwright E2E tests.

> Built as a portfolio project demonstrating SAP Fioneer-style architecture for the Cloud-Native Frontend Developer Intern position.

![CI](https://github.com/J4jatin/fioneer-credit-workspace/actions/workflows/e2e.yml/badge.svg)

---

## Live Demo

| Service | URL |
|---|---|
| 🌐 Frontend | https://fioneer-credit-workspace.vercel.app |
| ⚙️ Backend API | https://fioneer-credit-workspace.onrender.com |
| 📖 API Docs | https://fioneer-credit-workspace.onrender.com/docs |

> Note: Backend is on Render free tier — first load may take 30s to wake up.

---

## Architecture: Micro Frontends

```
fioneer-credit-workspace/
├── shell/                         # Host app — React 18 + TypeScript + Vite
│   └── src/
│       ├── microfrontends/
│       │   ├── LoanDashboard.tsx  # MFE 1 — list, filter, search, create loans
│       │   ├── LoanDetail.tsx     # MFE 2 — lifecycle pipeline + stage transitions
│       │   └── AnalyticsPanel.tsx # MFE 3 — portfolio KPIs + Recharts charts
│       └── api/loans.ts           # Tanstack React Query API layer
├── backend/                       # FastAPI REST API — Python 3.12
│   └── main.py                    # 5 endpoints + stage machine logic
└── e2e-tests/                     # Playwright E2E test suite
    ├── playwright.config.ts
    └── tests/
        ├── loan-dashboard.spec.ts  # 9 tests
        ├── loan-detail.spec.ts     # 6 tests
        └── analytics.spec.ts      # 6 tests — 23 total, all passing ✅
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript | Type-safe component architecture |
| Data fetching | **Tanstack React Query** | Server state caching, mutations, background refetch |
| UI components | @ui5/webcomponents-react | SAP's enterprise design system |
| Charts | Recharts | Composable SVG charts |
| Routing | React Router v6 | Client-side navigation |
| Build tool | Vite | Fast HMR development |
| Backend | FastAPI + Python 3.12 | Auto-generated OpenAPI docs, Pydantic validation |
| E2E Testing | **Playwright** | Cross-browser automated testing |
| CI/CD | **GitHub Actions** | Runs 23 E2E tests on every push |

---

## Features

### Loan Dashboard (MFE 1)
- View all commercial real estate loans in a filterable table
- Filter by stage: APPLICATION / REVIEW / APPROVED / ACTIVE / CLOSED
- Real-time search by borrower name or property address
- Create new loan applications via form

### Loan Detail (MFE 2)
- Visual lifecycle pipeline showing current stage
- Controlled stage transitions with backend validation
- Financial details including estimated monthly payment
- React Query cache updates — no page reload needed

### Analytics Panel (MFE 3)
- Portfolio KPIs: total loans, total value, avg interest rate, active loans
- Bar chart: loan count by stage
- Pie chart: portfolio value distribution
- Auto-refreshes every 30 seconds

---

## Loan Lifecycle State Machine

```
APPLICATION → REVIEW → APPROVED → ACTIVE → CLOSED
                ↓            ↓
           APPLICATION    REVIEW
```

Transitions validated on backend — invalid moves return HTTP 400.

---

## Quick Start

### 1. Backend
```bash
cd backend
py -3.12 -m pip install -r requirements.txt
py -3.12 -m uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### 2. Frontend
```bash
cd shell
npm install
npm run dev
```
App: http://localhost:3000

### 3. E2E Tests
```bash
cd e2e-tests
npm install
npx playwright install chromium
npx playwright test
```

---

## CI/CD Pipeline

Every `git push` to `main` triggers GitHub Actions:
1. Sets up Python 3.12 + Node.js 20
2. Installs all dependencies
3. Installs Playwright + Chromium
4. Runs all 23 E2E tests
5. Uploads HTML test report as artifact

---

## Key Concepts

**Micro Frontends** — Each view is an independently deployable unit with its own state and data fetching. The shell app composes them via React Router.

**Tanstack React Query** — Manages all server state: caching (30s stale time), background refetching, mutation lifecycle with cache invalidation.

**Stage Machine** — Loans follow strict valid transitions enforced on both frontend and backend.

**E2E Testing** — Playwright controls a real Chromium browser, testing complete user workflows, integrated into GitHub Actions CI/CD.

---

## Author

**Jattin Shah** — MSc Applied AI, TU Dresden
[LinkedIn](https://linkedin.com/in/jattin-shah) · [GitHub](https://github.com/J4jatin)
