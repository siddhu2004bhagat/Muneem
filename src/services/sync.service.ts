// Offline sync queue (front-end side). Batch posts to local FastAPI when online.
type QueueItem = { id: string; type: 'draw' | 'shape' | 'ocr' | 'ledger'; payload: unknown; createdAt: number };

type Hooks = {
  onSyncStart?: () => void;
  onSyncComplete?: (count: number) => void;
  onError?: (error: unknown) => void;
};

const queue: QueueItem[] = [];

export function enqueue(item: Omit<QueueItem, 'id' | 'createdAt'>) {
  queue.push({ id: `q_${Date.now()}_${Math.random()}`, createdAt: Date.now(), ...item });
}

export async function flush(hooks: Hooks = {}) {
  if (queue.length === 0) return 0;
  hooks.onSyncStart?.();
  const batch = queue.splice(0, queue.length);
  try {
    // Local FastAPI stub endpoint; replace with real URL when backend is ready
    await fetch('/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(batch) });
    hooks.onSyncComplete?.(batch.length);
    return batch.length;
  } catch (e) {
    // Requeue on failure
    batch.forEach(i => queue.push(i));
    hooks.onError?.(e);
    return 0;
  }
}

export function pendingCount() { return queue.length }


