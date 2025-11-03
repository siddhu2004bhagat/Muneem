from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import sqlite3
import os

router = APIRouter()

class UPIReconcileRequest(BaseModel):
    id: str
    txnRef: str
    amount: float
    upiId: str
    timestamp: int

class UPIReconcileResponse(BaseModel):
    success: bool
    message: str
    reconcileId: Optional[str] = None

# Initialize SQLite database for reconciliation log
DB_PATH = "upi_reconcile_log.db"

def init_upi_db():
    """Initialize UPI reconciliation log database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS upi_reconcile_log (
            id TEXT PRIMARY KEY,
            txn_ref TEXT NOT NULL,
            amount REAL NOT NULL,
            upi_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending'
        )
    ''')
    
    conn.commit()
    conn.close()

@router.post("/upi/reconcile", response_model=UPIReconcileResponse)
async def reconcile_upi_payment(request: UPIReconcileRequest):
    """
    Log UPI reconciliation request
    This is a stub endpoint for manual reconciliation tracking
    """
    try:
        # Initialize database if not exists
        init_upi_db()
        
        # Validate request
        if not request.id or not request.txnRef:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")
        
        # Store in SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO upi_reconcile_log 
            (id, txn_ref, amount, upi_id, timestamp, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            request.id,
            request.txnRef,
            request.amount,
            request.upiId,
            request.timestamp,
            'reconciled'
        ))
        
        conn.commit()
        conn.close()
        
        return UPIReconcileResponse(
            success=True,
            message=f"UPI reconciliation logged: {request.txnRef}",
            reconcileId=request.id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reconciliation failed: {str(e)}")

@router.get("/upi/reconcile/{txn_ref}")
async def get_reconcile_status(txn_ref: str):
    """Get reconciliation status by transaction reference"""
    try:
        init_upi_db()
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, txn_ref, amount, upi_id, timestamp, status, created_at
            FROM upi_reconcile_log 
            WHERE txn_ref = ?
        ''', (txn_ref,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {
            "id": result[0],
            "txnRef": result[1],
            "amount": result[2],
            "upiId": result[3],
            "timestamp": result[4],
            "status": result[5],
            "createdAt": result[6]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve status: {str(e)}")

@router.get("/upi/reconcile")
async def list_reconcile_logs(limit: int = 50, offset: int = 0):
    """List recent reconciliation logs"""
    try:
        init_upi_db()
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, txn_ref, amount, upi_id, timestamp, status, created_at
            FROM upi_reconcile_log 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "txnRef": row[1],
                "amount": row[2],
                "upiId": row[3],
                "timestamp": row[4],
                "status": row[5],
                "createdAt": row[6]
            }
            for row in results
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@router.delete("/upi/reconcile/{reconcile_id}")
async def delete_reconcile_log(reconcile_id: str):
    """Delete reconciliation log entry"""
    try:
        init_upi_db()
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM upi_reconcile_log WHERE id = ?', (reconcile_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Reconciliation log not found")
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Reconciliation log deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete log: {str(e)}")
