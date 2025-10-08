import { penDB } from '@/lib/localStore';

export async function exportBackup(): Promise<Blob> {
  const [strokes, shapes, ocr] = await Promise.all([
    penDB.strokes.toArray(), penDB.shapes.toArray(), penDB.ocr.toArray(),
  ]);
  const snapshot = { version: 1, date: Date.now(), strokes, shapes, ocr };
  const data = new TextEncoder().encode(JSON.stringify(snapshot));
  return new Blob([data], { type: 'application/octet-stream' });
}

export async function importBackup(file: File) {
  const buf = await file.arrayBuffer();
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf)));
  if (!json || typeof json !== 'object') throw new Error('Invalid backup');
  await penDB.transaction('rw', penDB.strokes, penDB.shapes, penDB.ocr, async () => {
    await Promise.all([penDB.strokes.clear(), penDB.shapes.clear(), penDB.ocr.clear()]);
    if (Array.isArray(json.strokes)) await penDB.strokes.bulkAdd(json.strokes);
    if (Array.isArray(json.shapes)) await penDB.shapes.bulkAdd(json.shapes);
    if (Array.isArray(json.ocr)) await penDB.ocr.bulkAdd(json.ocr);
  });
}


