from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uuid

app = FastAPI(title="Fioneer Credit Workspace API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class Loan(BaseModel):
    id: str
    borrower: str
    property_address: str
    loan_amount: float
    interest_rate: float
    stage: str  # APPLICATION | REVIEW | APPROVED | ACTIVE | CLOSED
    created_at: str
    updated_at: str

class LoanCreate(BaseModel):
    borrower: str
    property_address: str
    loan_amount: float
    interest_rate: float

class LoanUpdate(BaseModel):
    stage: str

# --- In-memory DB ---
loans_db: List[Loan] = [
    Loan(id="1", borrower="Anna Müller", property_address="Hauptstraße 12, Dresden", loan_amount=450000, interest_rate=3.5, stage="ACTIVE", created_at="2026-01-10", updated_at="2026-03-15"),
    Loan(id="2", borrower="Thomas Weber", property_address="Berliner Str. 88, Leipzig", loan_amount=320000, interest_rate=4.1, stage="REVIEW", created_at="2026-03-01", updated_at="2026-05-20"),
    Loan(id="3", borrower="Maria Schmidt", property_address="Königsallee 5, Düsseldorf", loan_amount=780000, interest_rate=3.8, stage="APPROVED", created_at="2026-02-14", updated_at="2026-04-30"),
    Loan(id="4", borrower="Klaus Fischer", property_address="Marktplatz 3, Frankfurt", loan_amount=560000, interest_rate=3.2, stage="APPLICATION", created_at="2026-05-20", updated_at="2026-05-20"),
    Loan(id="5", borrower="Sophie Bauer", property_address="Schlossweg 17, Munich", loan_amount=920000, interest_rate=4.5, stage="CLOSED", created_at="2025-06-01", updated_at="2026-01-01"),
    Loan(id="6", borrower="Hans Richter", property_address="Gartenstr. 44, Hamburg", loan_amount=275000, interest_rate=3.9, stage="ACTIVE", created_at="2026-01-25", updated_at="2026-04-10"),
]

VALID_STAGES = ["APPLICATION", "REVIEW", "APPROVED", "ACTIVE", "CLOSED"]
STAGE_TRANSITIONS = {
    "APPLICATION": ["REVIEW"],
    "REVIEW": ["APPROVED", "APPLICATION"],
    "APPROVED": ["ACTIVE", "REVIEW"],
    "ACTIVE": ["CLOSED"],
    "CLOSED": [],
}

# --- Routes ---
@app.get("/")
def root():
    return {"message": "Fioneer Credit Workspace API", "version": "1.0.0"}

@app.get("/loans", response_model=List[Loan])
def get_loans(stage: Optional[str] = None, search: Optional[str] = None):
    result = loans_db
    if stage:
        result = [l for l in result if l.stage == stage.upper()]
    if search:
        s = search.lower()
        result = [l for l in result if s in l.borrower.lower() or s in l.property_address.lower()]
    return result

@app.get("/loans/{loan_id}", response_model=Loan)
def get_loan(loan_id: str):
    loan = next((l for l in loans_db if l.id == loan_id), None)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@app.post("/loans", response_model=Loan)
def create_loan(data: LoanCreate):
    loan = Loan(
        id=str(uuid.uuid4())[:8],
        borrower=data.borrower,
        property_address=data.property_address,
        loan_amount=data.loan_amount,
        interest_rate=data.interest_rate,
        stage="APPLICATION",
        created_at=str(date.today()),
        updated_at=str(date.today()),
    )
    loans_db.append(loan)
    return loan

@app.patch("/loans/{loan_id}/stage", response_model=Loan)
def update_stage(loan_id: str, data: LoanUpdate):
    loan = next((l for l in loans_db if l.id == loan_id), None)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    new_stage = data.stage.upper()
    if new_stage not in VALID_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of {VALID_STAGES}")
    allowed = STAGE_TRANSITIONS.get(loan.stage, [])
    if new_stage not in allowed:
        raise HTTPException(status_code=400, detail=f"Cannot move from {loan.stage} to {new_stage}. Allowed: {allowed}")
    loan.stage = new_stage
    loan.updated_at = str(date.today())
    return loan

@app.get("/analytics/summary")
def get_summary():
    total = len(loans_db)
    total_value = sum(l.loan_amount for l in loans_db)
    by_stage = {}
    for stage in VALID_STAGES:
        count = len([l for l in loans_db if l.stage == stage])
        value = sum(l.loan_amount for l in loans_db if l.stage == stage)
        by_stage[stage] = {"count": count, "total_value": value}
    avg_rate = sum(l.interest_rate for l in loans_db) / total if total else 0
    return {
        "total_loans": total,
        "total_portfolio_value": total_value,
        "average_interest_rate": round(avg_rate, 2),
        "by_stage": by_stage,
    }
