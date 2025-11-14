import Dexie, { Table } from 'dexie';
import type { UPIIntent, UPIReconcileRequest } from '@/features/payments/types/upi.types';

export interface User {
  id?: number;
  username: string;
  pinHash: string;
  role: 'owner' | 'accountant' | 'employee';
  createdAt: Date;
}

export interface LedgerEntry {
  id?: number;
  date: string;
  description: string;
  amount: number;
  type: 'sale' | 'purchase' | 'expense' | 'receipt';
  gstRate: number;
  gstAmount: number;
  // CHANGED: userId → created_by (nullable, matches backend)
  created_by?: number | null;
  // CHANGED: createdAt: Date → created_at: string (ISO format, matches backend)
  created_at: string;
  // NEW FIELDS (Week-1 Ledger Enhancement)
  party_name?: string;
  reference_no?: string;
  tags?: string;
  is_active?: boolean;
  deleted_at?: string | null;
  updated_at?: string;
  // Optional inventory fields (keep for backward compat)
  itemId?: number;
  qty?: number;
  // Legacy fields (keep for backward compat during migration)
  userId?: number;  // Deprecated - use created_by
  createdAt?: Date; // Deprecated - use created_at
}

export interface GSTRecord {
  id?: number;
  ledgerId: number;
  taxAmount: number;
  status: 'pending' | 'filed';
  createdAt: Date;
}

export class DigBahiDB extends Dexie {
  users!: Table<User>;
  ledger!: Table<LedgerEntry>;
  gstRecords!: Table<GSTRecord>;
  upiIntents!: Table<UPIIntent>;
  syncQueue!: Table<UPIReconcileRequest>;
  items!: Table<any>;
  stockTxns!: Table<any>;

  constructor() {
    super('digbahi');
    
    // Version 2: Initial schema
    this.version(2).stores({
      users: '++id, username, role',
      ledger: '++id, date, type, userId, createdAt',
      gstRecords: '++id, ledgerId, status, createdAt',
      upiIntents: 'id, upiId, status, createdAt',
      syncQueue: 'id, txnRef, timestamp'
    });
    
    // Version 3: Add inventory tables
    this.version(3).stores({
      users: '++id, username, role',
      ledger: '++id, date, type, userId, createdAt',
      gstRecords: '++id, ledgerId, status, createdAt',
      upiIntents: 'id, upiId, status, createdAt',
      syncQueue: 'id, txnRef, timestamp',
      items: '++id,nameKey,sku',
      stockTxns: '++id,itemId,date,refLedgerId'
    }).upgrade(() => {
      // Migration: create inventory tables if they don't exist
      // No data transformation needed
    });
    
    // Version 5: Fix invalid compound indexes
    this.version(5).stores({
      users: '++id, username, role',
      ledger: '++id, date, type, userId, createdAt',
      gstRecords: '++id, ledgerId, status, createdAt',
      upiIntents: 'id, upiId, status, createdAt',
      syncQueue: 'id, txnRef, timestamp',
      // OPTIMIZED INVENTORY INDEXES - Fixed compound indexes
      items: '++id,nameKey,sku,gstRate,unit,createdAt',
      stockTxns: '++id,itemId,date,refLedgerId,type'
    }).upgrade(async (tx) => {
      // Safe migration - no data loss, just adds indexes
      console.log('🚀 Upgrading to optimized database indexes...');
      console.log('✅ Added individual indexes for faster queries');
      console.log('✅ Added search-optimized indexes');
      console.log('✅ Added stock transaction indexes');
    });
  }
}

export const db = new DigBahiDB();

// Initialize with demo user if empty
export async function initializeDB() {
  const userCount = await db.users.count();
  if (userCount === 0) {
    // Demo PIN: "1234" - SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode('1234');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    await db.users.add({
      username: 'demo',
      pinHash,
      role: 'owner',
      createdAt: new Date()
    });
  }
}

// UPI Intent CRUD operations
export async function saveUPIIntent(intent: UPIIntent): Promise<void> {
  await db.upiIntents.put(intent);
}

export async function updateUPIIntentStatus(id: string, status: UPIIntent['status']): Promise<void> {
  await db.upiIntents.update(id, { 
    status, 
    updatedAt: Date.now() 
  });
}

export async function listUPIIntents(): Promise<UPIIntent[]> {
  return await db.upiIntents.orderBy('createdAt').reverse().toArray();
}

export async function getUPIIntent(id: string): Promise<UPIIntent | undefined> {
  return await db.upiIntents.get(id);
}

// Sync Queue operations
export async function enqueueReconcile(request: UPIReconcileRequest): Promise<void> {
  await db.syncQueue.put(request);
}

export async function getSyncQueue(): Promise<UPIReconcileRequest[]> {
  return await db.syncQueue.orderBy('timestamp').toArray();
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  await db.syncQueue.delete(id);
}
