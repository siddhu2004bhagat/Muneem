from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .base import Base

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    description = Column(String, default="")
    amount = Column(Float)
    type = Column(String, index=True)  # sale|purchase|expense|receipt
    gstRate = Column(Float, default=0.0)  # GST rate (e.g., 5.0, 12.0, 18.0)
    gstAmount = Column(Float, default=0.0)  # Calculated GST amount
    created_at = Column(DateTime, default=datetime.utcnow)

# Roles and audit (Phase 9)
from sqlalchemy import ForeignKey

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(String, default="")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    pin_hash = Column(String)
    device_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    device_id = Column(String)

# Session model for multi-user sessions
class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_token = Column(String, index=True)
    device_id = Column(String, index=True)
    expires_at = Column(DateTime)


