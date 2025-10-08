from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db.base import get_db, Base, engine
from ...services.audit_service import list_recent, record_action

router = APIRouter(prefix="/api/v1")
Base.metadata.create_all(bind=engine)

@router.get("/audit")
def audit_list(limit: int = 100, db: Session = Depends(get_db)):
    return list_recent(db, limit)

@router.post("/audit/test")
def audit_test(action: str, resource: str, db: Session = Depends(get_db)):
    return record_action(db, user_id=0, action=action, resource=resource)


