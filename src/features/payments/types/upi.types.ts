export type UPIStatus = 'draft' | 'initiated' | 'pending' | 'reconciled' | 'failed';

export interface UPIIntent {
  id: string;               // uuid
  upiId: string;
  payerName?: string;
  amount: number;
  note?: string;
  txnRef: string;           // auto-generated
  status: UPIStatus;
  createdAt: number;
  updatedAt: number;
}

export interface UPIReconcileRequest {
  id: string;
  txnRef: string;
  amount: number;
  upiId: string;
  timestamp: number;
}

export interface UPIIntentLink {
  link: string;
  qrData: string;
  txnRef: string;
}
