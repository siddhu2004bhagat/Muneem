from pydantic import BaseModel, Field, validator, field_validator, model_validator
from typing import Optional, Literal
from datetime import datetime
import re

# Date validation pattern
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")

class LedgerEntryCreate(BaseModel):
    """Ledger entry creation schema with validation"""
    date: str = Field(..., description="YYYY-MM-DD")
    description: str = Field(default="", max_length=200)
    amount: float = Field(..., ge=0)
    type: Literal["sale", "purchase", "expense", "receipt"]
    gstRate: float = Field(default=0.0, ge=0, le=100)
    gstAmount: Optional[float] = Field(None, ge=0)
    party_name: str = Field(default="", max_length=100)
    reference_no: str = Field(default="", max_length=50)
    tags: str = Field(default="", max_length=200)
    idempotency_key: Optional[str] = Field(None, max_length=100)
    
    @field_validator("date")
    @classmethod
    def validate_date(cls, v):
        """Validate date format, not in future, and within ±10 years"""
        # Format check
        if not DATE_PATTERN.match(v):
            raise ValueError("date must be YYYY-MM-DD")
        
        # Parse and validate actual date
        try:
            parsed = datetime.strptime(v, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Invalid date (e.g., 2024-02-30 doesn't exist)")
        
        # Business rule: no future dates
        today = datetime.now().date()
        if parsed > today:
            raise ValueError("Date cannot be in the future")
        
        # Boundary: no dates older than 10 years
        if (today - parsed).days > 3650:
            raise ValueError("Date too old (max 10 years)")
        
        return v
    
    @model_validator(mode='before')
    @classmethod
    def calculate_gst_if_needed(cls, values):
        """Auto-calculate gstAmount if gstRate > 0 and gstAmount not provided"""
        if isinstance(values, dict):
            gst_rate = values.get('gstRate', 0)
            gst_amount = values.get('gstAmount')
            amount = values.get('amount', 0)
            
            if gst_rate > 0 and gst_amount is None:
                values['gstAmount'] = round(amount * (gst_rate / 100), 2)
            
            # Sanity check: gstAmount should not exceed reasonable bounds
            if values.get('gstAmount') and amount > 0:
                max_gst = amount * 1.28  # 128% max (28% GST + 100% base)
                if values['gstAmount'] > max_gst:
                    raise ValueError(f"GST amount {values['gstAmount']} exceeds reasonable limit")
        
        return values
    
    @field_validator("description", "party_name", "reference_no", "tags")
    @classmethod
    def strip_whitespace(cls, v):
        """Strip whitespace from string fields"""
        return v.strip() if v else ""

class LedgerEntryOut(LedgerEntryCreate):
    """Ledger entry output schema"""
    id: int
    is_active: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # ✅ Pydantic v2 (NOT orm_mode)


# ========================================
# INVENTORY SCHEMAS (Week 1 - Backend Foundation)
# ========================================

class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: Optional[str] = Field(None, max_length=50)
    hsn_code: Optional[str] = Field(None, max_length=20)
    gst_rate: float = 0.0
    opening_qty: float = Field(0.0, ge=0)
    unit: str = Field(..., min_length=1, max_length=20)
    min_qty: Optional[float] = Field(0.0, ge=0)
    mrp: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    purchase_price: Optional[float] = Field(None, ge=0)
    
    @validator("name")
    def sanitize_name(cls, v):
        # Remove extra whitespace and sanitize
        v = v.strip().replace('\n', ' ').replace('\r', ' ')
        return ' '.join(v.split())
    
    @validator("sku")
    def sanitize_sku(cls, v):
        if v:
            # Remove whitespace and convert to uppercase
            return v.strip().upper()
        return v
    
    @validator("hsn_code")
    def sanitize_hsn(cls, v):
        if v:
            # Remove whitespace and keep format
            return v.strip()
        return v
    
    @validator("gst_rate")
    def validate_gst_rate(cls, v):
        if v not in [0, 5, 12, 18, 28]:
            raise ValueError("GST rate must be 0, 5, 12, 18, or 28")
        return v
    
    @validator("sale_price", "purchase_price")
    def validate_prices(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemOut(InventoryItemBase):
    id: int
    name_key: str
    is_active: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # ✅ Pydantic v2


class StockTransactionCreate(BaseModel):
    item_id: int = Field(..., gt=0)
    date: str = Field(..., pattern="^\d{4}-\d{2}-\d{2}$")
    type: str = Field(..., pattern="^(open|purchase|sale|adjustment)$")
    qty: float
    ref_ledger_id: Optional[int] = Field(None, gt=0)
    
    @validator("qty")
    def validate_qty(cls, v):
        if v == 0:
            raise ValueError("Quantity cannot be zero")
        return v

class StockTransactionOut(StockTransactionCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # ✅ Pydantic v2


class InventorySummary(BaseModel):
    item_id: int
    name: str
    stock: float
    value: float
    gst_rate: float


