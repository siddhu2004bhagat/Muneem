from typing import Optional
from sqlalchemy.orm import Session
from ..db.models import AuditLog

def record_action(db: Session, user_id: int, action: str, resource: str, device_id: Optional[str] = None):
  log = AuditLog(user_id=user_id, action=action, resource=resource, device_id=device_id or "")
  db.add(log)
  db.commit()
  return log

def list_recent(db: Session, limit: int = 100):
  return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()


