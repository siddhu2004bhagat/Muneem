# ✅ CURSOR PROMPT — LEDGER WEEK-1 (PRODUCTION-READY)

**Mission:** Ship a minimal, production-safe Ledger backend + frontend integration with pagination/filters, soft delete, idempotency, strict validation, consistent error format, WebSocket events, and type-safe frontend integration.

**White-screen guard:** Frontend API is **feature-flagged** (`VITE_ENABLE_LEDGER_API`) and **falls back to Dexie** on any failure. **No Dexie schema edits**.

---

## 🔒 PHASE 0 — PRE-FLIGHT & SAFETY GUARDS (DO NOT SKIP)

1. **Do not touch** `db.ts` Dexie schemas in this task.

2. **Environment Variables**

   Create `.env.example` (if missing) with:
   ```
   VITE_ENABLE_LEDGER_API=false
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Alembic Preflight**

   * If `alembic.ini` & `migrations/` **exist** → create a proper migration for new columns/indexes.
   * If **not present** → **do not write manual SQL**. Use `Base.metadata.create_all()` (temporary) and add comment: `# TODO: Initialize Alembic in Week-2 for proper migrations`

4. **Error Envelope Standard**

   Standardize **error envelope** for ledger API responses:
   ```json
   { "error": "CODE", "message": "human readable", "details": { ...optional } }
   ```

5. **Dexie Instance Clarification**

   **IMPORTANT:** Use `db.ledger` from `src/lib/db.ts` (main `DigBahiDB` instance). 
   - **DO NOT** use `src/services/ledger.service.ts` separate DB instance.
   - The adapter should import: `import { db } from '@/lib/db'` and use `db.ledger`.

---

## 🧱 PHASE 1 — BACKEND (MODELS, SCHEMAS, API, IDEMPOTENCY, WS)

### 1A) Models (SQLAlchemy)

File: `backend/app/db/models.py`

* **Extend existing `LedgerEntry`** (non-breaking, add columns only):

  ```python
  class LedgerEntry(Base):
      __tablename__ = "ledger_entries"
      
      # Existing fields (DO NOT MODIFY)
      id = Column(Integer, primary_key=True, index=True)
      date = Column(String, index=True)
      description = Column(String, default="")
      amount = Column(Float)
      type = Column(String, index=True)  # sale|purchase|expense|receipt
      gstRate = Column(Float, default=0.0)
      gstAmount = Column(Float, default=0.0)
      created_at = Column(DateTime, default=datetime.utcnow)
      
      # NEW FIELDS (add these)
      party_name = Column(String, index=True, default="")
      reference_no = Column(String, index=True, default="")
      tags = Column(String, default="")  # comma-separated for now
      is_active = Column(Boolean, default=True, nullable=False)
      deleted_at = Column(DateTime, nullable=True)
      updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
      created_by = Column(Integer, nullable=True)  # placeholder for auth
  ```

* **Idempotency Registry Table** (new):

  ```python
  class LedgerIdempotencyKey(Base):
      __tablename__ = "ledger_idempotency_keys"
      key = Column(String, primary_key=True, index=True)
      entry_id = Column(Integer, index=True, nullable=False)
      created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
  ```

> Ensure `date`, `type`, `party_name`, `reference_no` are indexed. If Alembic present: add migration; else rely on `Base.metadata.create_all()` with TODO comment.

### 1B) Pydantic Schemas

File: `backend/app/db/schemas.py`

* **LedgerEntryCreate** (input):

  ```python
  from pydantic import BaseModel, Field, validator, root_validator
  from typing import Literal, Optional
  from datetime import datetime
  import re
  
  DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
  
  class LedgerEntryCreate(BaseModel):
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
      
      @validator("date")
      def validate_date(cls, v):
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
      
      @root_validator
      def calculate_gst_if_needed(cls, values):
          """Auto-calculate gstAmount if gstRate > 0 and gstAmount not provided"""
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
      
      @validator("description", "party_name", "reference_no", "tags")
      def strip_whitespace(cls, v):
          return v.strip() if v else ""
  ```

* **LedgerEntryOut** (output):

  ```python
  class LedgerEntryOut(LedgerEntryCreate):
      id: int
      is_active: bool
      deleted_at: Optional[datetime] = None
      created_at: datetime
      updated_at: datetime
      
      class Config:
          from_attributes = True  # ✅ Pydantic v2 (NOT orm_mode)
  ```

> **CRITICAL:** Use `from_attributes = True` in `Config` class (Pydantic v2). Do NOT use deprecated `orm_mode`.

### 1C) API Routes (FastAPI)

File: `backend/app/api/v1/ledger.py`

* **Add error helper** at top of file:

  ```python
  from fastapi import APIRouter, Depends, HTTPException, Query
  from sqlalchemy.orm import Session
  from sqlalchemy.exc import IntegrityError
  from typing import List, Optional
  from datetime import datetime
  from ...db.base import get_db
  from ...db import models, schemas
  from .sync_ws import broadcast
  
  router = APIRouter(prefix="/api/v1", tags=["Ledger"])
  
  def http_error(status: int, code: str, message: str, details: dict = None):
      """Helper for consistent error envelope"""
      raise HTTPException(
          status_code=status,
          detail={
              "error": code,
              "message": message,
              "details": details or {}
          }
      )
  
  def broadcast_event(event_data: dict):
      """Helper function to broadcast events in background thread"""
      import threading
      import asyncio
      
      def run_broadcast():
          try:
              loop = asyncio.new_event_loop()
              asyncio.set_event_loop(loop)
              loop.run_until_complete(broadcast(event_data))
              loop.close()
          except Exception as e:
              print(f"Broadcast error (non-critical): {e}")
      
      threading.Thread(target=run_broadcast, daemon=True).start()
  ```

* **GET `/ledger`** (list with filters/pagination):

  ```python
  @router.get("/ledger", response_model=List[schemas.LedgerEntryOut])
  def get_ledger(
      skip: int = Query(0, ge=0),
      limit: int = Query(50, ge=1, le=200),
      search: str = Query("", description="Search description, party_name, reference_no, tags"),
      type: Optional[str] = Query(None, description="Filter by type"),
      from_: str = Query("", alias="from", description="Date from (YYYY-MM-DD)"),
      to: str = Query("", description="Date to (YYYY-MM-DD)"),
      db: Session = Depends(get_db)
  ):
      """Get paginated ledger entries with filters"""
      query = db.query(models.LedgerEntry).filter(models.LedgerEntry.is_active == True)
      
      # Type filter
      if type:
          query = query.filter(models.LedgerEntry.type == type)
      
      # Date range filter
      if from_ and to:
          try:
              # Validate date format
              datetime.strptime(from_, "%Y-%m-%d")
              datetime.strptime(to, "%Y-%m-%d")
              query = query.filter(
                  models.LedgerEntry.date >= from_,
                  models.LedgerEntry.date <= to
              )
          except ValueError:
              pass  # Ignore invalid dates
      
      # Search filter (ILIKE on multiple fields)
      if search:
          search_like = f"%{search.strip().lower()}%"
          query = query.filter(
              (models.LedgerEntry.description.ilike(search_like)) |
              (models.LedgerEntry.party_name.ilike(search_like)) |
              (models.LedgerEntry.reference_no.ilike(search_like)) |
              (models.LedgerEntry.tags.ilike(search_like))
          )
      
      # Order by id DESC (newest first)
      entries = query.order_by(models.LedgerEntry.id.desc()).offset(skip).limit(limit).all()
      
      return entries  # Return plain array (not wrapped) to match inventory pattern
  ```

* **POST `/ledger`** (create with idempotency):

  ```python
  @router.post("/ledger", response_model=schemas.LedgerEntryOut)
  def create_ledger_entry(entry: schemas.LedgerEntryCreate, db: Session = Depends(get_db)):
      """Create ledger entry with idempotency support"""
      try:
          # Idempotency check (within transaction)
          if entry.idempotency_key:
              existing_key = db.query(models.LedgerIdempotencyKey).filter(
                  models.LedgerIdempotencyKey.key == entry.idempotency_key
              ).first()
              
              if existing_key:
                  # Return existing entry
                  existing_entry = db.query(models.LedgerEntry).filter(
                      models.LedgerEntry.id == existing_key.entry_id
                  ).first()
                  
                  if existing_entry:
                      http_error(
                          409,
                          "IDEMPOTENT_DUPLICATE",
                          "Entry with this idempotency_key already exists",
                          {"entry_id": existing_key.entry_id}
                      )
          
          # Create entry
          db_entry = models.LedgerEntry(
              date=entry.date,
              description=entry.description,
              amount=entry.amount,
              type=entry.type,
              gstRate=entry.gstRate,
              gstAmount=entry.gstAmount,
              party_name=entry.party_name,
              reference_no=entry.reference_no,
              tags=entry.tags,
              created_by=None  # TODO: Get from auth context
          )
          
          db.add(db_entry)
          db.flush()  # Get entry.id without committing
          
          # Store idempotency key if provided
          if entry.idempotency_key:
              db.add(models.LedgerIdempotencyKey(
                  key=entry.idempotency_key,
                  entry_id=db_entry.id
              ))
          
          db.commit()
          db.refresh(db_entry)
          
          # Broadcast WebSocket event (full entry data to match inventory pattern)
          broadcast_event({
              "type": "ledger_entry_created",
              "data": {
                  "id": db_entry.id,
                  "date": db_entry.date,
                  "description": db_entry.description,
                  "amount": db_entry.amount,
                  "type": db_entry.type,
                  "gstRate": db_entry.gstRate,
                  "gstAmount": db_entry.gstAmount,
                  "party_name": db_entry.party_name,
                  "reference_no": db_entry.reference_no,
                  "tags": db_entry.tags,
                  "is_active": db_entry.is_active,
                  "created_at": db_entry.created_at.isoformat() if db_entry.created_at else None,
                  "updated_at": db_entry.updated_at.isoformat() if db_entry.updated_at else None
              },
              "timestamp": datetime.utcnow().isoformat()
          })
          
          return db_entry
          
      except HTTPException:
          raise
      except IntegrityError as e:
          db.rollback()
          http_error(400, "DATABASE_ERROR", "Database integrity constraint violation", {"details": str(e)})
      except Exception as e:
          db.rollback()
          http_error(500, "INTERNAL_ERROR", "Failed to create entry", {"details": str(e)})
  ```

* **PUT `/ledger/{id}`** (update):

  ```python
  @router.put("/ledger/{id}", response_model=schemas.LedgerEntryOut)
  def update_ledger_entry(
      id: int,
      entry: schemas.LedgerEntryCreate,
      db: Session = Depends(get_db)
  ):
      """Update ledger entry"""
      db_entry = db.query(models.LedgerEntry).filter(
          models.LedgerEntry.id == id,
          models.LedgerEntry.is_active == True
      ).first()
      
      if not db_entry:
          http_error(404, "NOT_FOUND", f"Ledger entry {id} not found")
      
      # Update mutable fields
      db_entry.date = entry.date
      db_entry.description = entry.description
      db_entry.amount = entry.amount
      db_entry.type = entry.type
      db_entry.gstRate = entry.gstRate
      db_entry.gstAmount = entry.gstAmount
      db_entry.party_name = entry.party_name
      db_entry.reference_no = entry.reference_no
      db_entry.tags = entry.tags
      db_entry.updated_at = datetime.utcnow()
      
      try:
          db.commit()
          db.refresh(db_entry)
          
          # Broadcast update event
          broadcast_event({
              "type": "ledger_entry_updated",
              "data": {
                  "id": db_entry.id,
                  "date": db_entry.date,
                  "description": db_entry.description,
                  "amount": db_entry.amount,
                  "type": db_entry.type,
                  "gstRate": db_entry.gstRate,
                  "gstAmount": db_entry.gstAmount,
                  "party_name": db_entry.party_name,
                  "reference_no": db_entry.reference_no,
                  "tags": db_entry.tags,
                  "is_active": db_entry.is_active,
                  "created_at": db_entry.created_at.isoformat() if db_entry.created_at else None,
                  "updated_at": db_entry.updated_at.isoformat() if db_entry.updated_at else None
              },
              "timestamp": datetime.utcnow().isoformat()
          })
          
          return db_entry
      except Exception as e:
          db.rollback()
          http_error(500, "INTERNAL_ERROR", "Failed to update entry", {"details": str(e)})
  ```

* **DELETE `/ledger/{id}`** (soft delete):

  ```python
  @router.delete("/ledger/{id}")
  def delete_ledger_entry(id: int, db: Session = Depends(get_db)):
      """Soft delete ledger entry"""
      db_entry = db.query(models.LedgerEntry).filter(
          models.LedgerEntry.id == id,
          models.LedgerEntry.is_active == True
      ).first()
      
      if not db_entry:
          http_error(404, "NOT_FOUND", f"Ledger entry {id} not found")
      
      # Soft delete
      db_entry.is_active = False
      db_entry.deleted_at = datetime.utcnow()
      
      try:
          db.commit()
          
          # Broadcast delete event
          broadcast_event({
              "type": "ledger_entry_deleted",
              "data": {
                  "id": db_entry.id,
                  "date": db_entry.date,
                  "type": db_entry.type,
                  "amount": db_entry.amount
              },
              "timestamp": datetime.utcnow().isoformat()
          })
          
          return {"message": "Entry soft-deleted successfully"}
      except Exception as e:
          db.rollback()
          http_error(500, "INTERNAL_ERROR", "Failed to delete entry", {"details": str(e)})
  ```

### 1D) Alembic (if present)

* If Alembic exists: Create migration adding columns & new idempotency table + indexes.
* If not present: Add comment in `models.py` and `ledger.py`: `# TODO: Initialize Alembic in Week-2 for proper migrations`

### 1E) Tests (backend)

File: `backend/tests/test_ledger_api.py`

* `test_create_entry_valid`
* `test_list_pagination_filters`
* `test_update_entry`
* `test_soft_delete`
* `test_idempotency_duplicate_returns_409`
* `test_websocket_event_broadcast` (mock WebSocket connection, verify event sent)
* Ensure error envelope shape is consistent across all endpoints.

---

## 🌐 PHASE 2 — FRONTEND (FEATURE-FLAGGED API + ADAPTER + STATE)

### 2A) Feature Flag

* In code:

  ```typescript
  const ENABLE_LEDGER_API = import.meta.env.VITE_ENABLE_LEDGER_API === 'true';
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  ```

* **Do not** import API directly in UI—use adapter only.

### 2B) API Service (abortable, consistent errors)

File: `src/services/ledger.api.ts`

```typescript
const API_ENDPOINT = `${API_BASE}/api/v1/ledger`;

export interface LedgerEntry {
  id?: number;
  date: string;
  description: string;
  amount: number;
  type: 'sale' | 'purchase' | 'expense' | 'receipt';
  gstRate: number;
  gstAmount: number;
  party_name: string;
  reference_no: string;
  tags: string;
  is_active: boolean;
  deleted_at?: string | null;
  created_by?: number | null;
  created_at: string;  // ISO format
  updated_at: string;  // ISO format
}

export interface LedgerListParams {
  skip?: number;
  limit?: number;
  search?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  details?: any;
}

/**
 * Abortable fetch helper with timeout
 */
async function fetchJSON<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    
    if (!res.ok) {
      const err: ApiError = json?.detail || {
        status: res.status,
        error: 'HTTP_ERROR',
        message: res.statusText,
      };
      throw err;
    }
    
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLedger(
  params: LedgerListParams = {},
  signal?: AbortSignal
): Promise<LedgerEntry[]> {
  const searchParams = new URLSearchParams();
  if (params.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.type) searchParams.set('type', params.type);
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  
  return fetchJSON<LedgerEntry[]>(
    `${API_ENDPOINT}?${searchParams}`,
    { signal }
  );
}

export async function createLedger(
  entry: Omit<LedgerEntry, 'id' | 'created_at' | 'updated_at' | 'is_active'>,
  options?: { idempotencyKey?: string },
  signal?: AbortSignal
): Promise<LedgerEntry> {
  const body: any = { ...entry };
  if (options?.idempotencyKey) {
    body.idempotency_key = options.idempotencyKey;
  }
  
  return fetchJSON<LedgerEntry>(API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });
}

export async function updateLedger(
  id: number,
  patch: Partial<LedgerEntry>,
  signal?: AbortSignal
): Promise<LedgerEntry> {
  return fetchJSON<LedgerEntry>(`${API_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
    signal,
  });
}

export async function softDeleteLedger(
  id: number,
  signal?: AbortSignal
): Promise<void> {
  await fetchJSON<void>(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE',
    signal,
  });
}
```

### 2C) Data Source Adapter

File: `src/services/ledger.datasource.ts`

**IMPORTANT:** Use `db.ledger` from `src/lib/db.ts` (main `DigBahiDB` instance). Do NOT use `ledger.service.ts` separate DB.

```typescript
import { db } from '@/lib/db';
import { LedgerEntry } from '@/lib/db';
import * as ledgerApi from './ledger.api';
import { toast } from 'sonner';

const ENABLE_LEDGER_API = import.meta.env.VITE_ENABLE_LEDGER_API === 'true';

export interface LedgerDataSource {
  list: (params?: ledgerApi.LedgerListParams, signal?: AbortSignal) => Promise<LedgerEntry[]>;
  create: (entry: Omit<LedgerEntry, 'id' | 'created_at' | 'updated_at'>, options?: { idempotencyKey?: string }, signal?: AbortSignal) => Promise<LedgerEntry>;
  update: (id: number, patch: Partial<LedgerEntry>, signal?: AbortSignal) => Promise<LedgerEntry>;
  remove: (id: number, signal?: AbortSignal) => Promise<void>;
}

// Local Dexie implementation
const localDataSource: LedgerDataSource = {
  async list(params = {}) {
    let query = db.ledger.orderBy('date').reverse();
    
    if (params.type) {
      query = query.filter(entry => entry.type === params.type);
    }
    
    const all = await query.toArray();
    
    // Client-side search (simple for now)
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      return all.filter(entry =>
        entry.description.toLowerCase().includes(searchLower) ||
        (entry.partyName && entry.partyName.toLowerCase().includes(searchLower))
      );
    }
    
    // Pagination
    const skip = params.skip || 0;
    const limit = params.limit || 50;
    return all.slice(skip, skip + limit);
  },
  
  async create(entry) {
    const newEntry: LedgerEntry = {
      ...entry,
      createdAt: new Date(),
    };
    const id = await db.ledger.add(newEntry);
    return { ...newEntry, id } as LedgerEntry;
  },
  
  async update(id, patch) {
    await db.ledger.update(id, patch);
    return await db.ledger.get(id) as LedgerEntry;
  },
  
  async remove(id) {
    await db.ledger.delete(id);
  },
};

// API implementation with fallback
const apiDataSource: LedgerDataSource = {
  async list(params, signal) {
    try {
      const entries = await ledgerApi.fetchLedger(params, signal);
      return entries;
    } catch (error: any) {
      console.error('API list failed, falling back to Dexie:', error);
      toast.warning('Server unreachable. Switched to local-only mode.');
      return localDataSource.list(params, signal);
    }
  },
  
  async create(entry, options, signal) {
    try {
      return await ledgerApi.createLedger(entry, options, signal);
    } catch (error: any) {
      console.error('API create failed, falling back to Dexie:', error);
      toast.warning('Server unreachable. Switched to local-only mode.');
      return localDataSource.create(entry);
    }
  },
  
  async update(id, patch, signal) {
    try {
      return await ledgerApi.updateLedger(id, patch, signal);
    } catch (error: any) {
      console.error('API update failed, falling back to Dexie:', error);
      toast.warning('Server unreachable. Switched to local-only mode.');
      return localDataSource.update(id, patch, signal);
    }
  },
  
  async remove(id, signal) {
    try {
      await ledgerApi.softDeleteLedger(id, signal);
    } catch (error: any) {
      console.error('API delete failed, falling back to Dexie:', error);
      toast.warning('Server unreachable. Switched to local-only mode.');
      await localDataSource.remove(id);
    }
  },
};

export function getLedgerDataSource(): LedgerDataSource {
  return ENABLE_LEDGER_API ? apiDataSource : localDataSource;
}
```

### 2D) Frontend Type Alignment

**CRITICAL:** Update frontend `LedgerEntry` interface in `src/lib/db.ts` to match backend schema:

```typescript
export interface LedgerEntry {
  id?: number;
  date: string;
  description: string;
  amount: number;
  type: 'sale' | 'purchase' | 'expense' | 'receipt';
  gstRate: number;
  gstAmount: number;
  // CHANGED: userId → created_by (nullable)
  created_by?: number | null;
  // CHANGED: createdAt: Date → created_at: string (ISO format)
  created_at: string;
  // NEW FIELDS
  party_name?: string;
  reference_no?: string;
  tags?: string;
  is_active?: boolean;
  deleted_at?: string | null;
  updated_at?: string;
  // Optional inventory fields (keep for backward compat)
  itemId?: number;
  qty?: number;
}
```

### 2E) Integrate into UI (safe)

Files: `src/components/layout/LedgerTable.tsx`, add-entry form component.

* Replace direct `db.ledger` access with adapter calls.

* **List flow** (with proper cleanup):

  ```typescript
  import { getLedgerDataSource } from '@/services/ledger.datasource';
  
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | undefined>();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  useEffect(() => {
    const ctrl = new AbortController();
    loadEntries(ctrl.signal);
    return () => ctrl.abort(); // ✅ Cleanup on unmount
  }, [page, limit, search, type, from, to]);
  
  async function loadEntries(signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const datasource = getLedgerDataSource();
      const data = await datasource.list(
        { skip: page * limit, limit, search, type, from, to },
        signal
      );
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }
  ```

* **Create/Update/Delete:**

  ```typescript
  async function handleCreate(entry: Omit<LedgerEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const datasource = getLedgerDataSource();
      await datasource.create(entry);
      toast.success('Entry created successfully');
      await loadEntries(); // Refetch
    } catch (err: any) {
      toast.error(err.message || 'Failed to create entry');
    }
  }
  ```

**CRITICAL:** Do not change existing render structure. Keep first paint risk near zero.

---

## 📦 PHASE 3 — NON-REGRESSION & TESTS (FLAG + FALLBACK)

### 3A) Frontend behavior matrix

* `VITE_ENABLE_LEDGER_API=false` → behaves exactly as today (Dexie only).
* `VITE_ENABLE_LEDGER_API=true` and backend **up** → API drives list & mutations.
* `VITE_ENABLE_LEDGER_API=true` and backend **down** → Dexie fallback with toast.

### 3B) Frontend tests (lightweight)

* Unit test adapter switching logic (flag on/off).
* Unit test fallback path (simulate 500/timeout → Dexie branch selected).

---

## ✅ ACCEPTANCE CRITERIA (DONE WHEN)

* **Backend**
  * `/ledger` supports `skip, limit, search, type, from, to`.
  * POST/PUT/DELETE work with **soft delete**.
  * **Idempotency** prevents duplicates (409) and stores key→entry link.
  * **Date validation** enforces ISO + no future + ±10y.
  * **GST auto-calc** when `gstRate>0` and `gstAmount` missing.
  * **Error envelope** consistent across routes: `{error, message, details?}`.
  * **WebSocket** events fire after mutations with full entry data.
  * **Pydantic v2** uses `from_attributes = True` (no warnings).

* **Frontend**
  * API behind **feature flag** with **abortable** requests.
  * Adapter used everywhere (no direct API/Dexie calls in UI).
  * **Fallback to Dexie** on API failure with clear toast.
  * `loading/error/refetch` states visible and stable.
  * **Types aligned** with backend (created_by, created_at, etc.).
  * **AbortController cleanup** in useEffect (no memory leaks).

* **Safety**
  * No Dexie schema change.
  * No blocking on render; no white screen.
  * Lint/type/build clean.

---

## 🎯 IMPLEMENTATION CHECKLIST

- [ ] Phase 0: Pre-flight checks complete
- [ ] Phase 1A: Models extended with new fields
- [ ] Phase 1B: Schemas with Pydantic v2 `from_attributes`
- [ ] Phase 1C: API routes with idempotency, WebSocket, error envelope
- [ ] Phase 1D: Alembic migration or TODO comment
- [ ] Phase 1E: Tests passing
- [ ] Phase 2A: Feature flag configured
- [ ] Phase 2B: API service with abortable fetch
- [ ] Phase 2C: Adapter using `db.ledger` from `src/lib/db.ts`
- [ ] Phase 2D: Frontend types aligned with backend
- [ ] Phase 2E: UI integrated with adapter (no direct DB calls)
- [ ] Phase 3: Non-regression tests passing

---

**Status:** ✅ **PRODUCTION-READY** - All issues from review addressed.

