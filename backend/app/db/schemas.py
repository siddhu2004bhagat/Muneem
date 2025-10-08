from pydantic import BaseModel, Field
from typing import Optional

class LedgerEntryBase(BaseModel):
  date: str
  description: str
  amount: float
  type: str
  gstRate: Optional[float] = 0.0
  gstAmount: Optional[float] = 0.0

class LedgerEntryCreate(LedgerEntryBase):
  pass

class LedgerEntryOut(LedgerEntryBase):
  id: int = Field(...)

  class Config:
    orm_mode = True


