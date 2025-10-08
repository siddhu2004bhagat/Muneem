from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db.base import Base, engine, get_db
from ...db.models import LedgerEntry
from ...db.schemas import LedgerEntryCreate, LedgerEntryOut
from typing import List

router = APIRouter(prefix="/api/v1")

# Create tables if missing
Base.metadata.create_all(bind=engine)

@router.get("/ledger", response_model=List[LedgerEntryOut])
def get_ledger(db: Session = Depends(get_db)):
    return db.query(LedgerEntry).order_by(LedgerEntry.id.desc()).all()

@router.post("/ledger", response_model=LedgerEntryOut)
def add_ledger(entry: LedgerEntryCreate, db: Session = Depends(get_db)):
    row = LedgerEntry(
        date=entry.date,
        description=entry.description,
        amount=entry.amount,
        type=entry.type,
        gstRate=entry.gstRate if entry.gstRate else 0.0,
        gstAmount=entry.gstAmount if entry.gstAmount else 0.0
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


