import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { stateSchema, LIMITS } from './store.mjs';

export async function migrate({ dataDir, fromSchemaVersion, toSchemaVersion }) {
  if (toSchemaVersion !== 1 || ![0, 1].includes(fromSchemaVersion)) throw new Error('Unsupported Ask data migration.');
  try {
    const bytes = await readFile(path.join(dataDir, 'ask.json'));
    if (bytes.length > LIMITS.stateBytes) throw new Error('Ask data is too large.');
    stateSchema.parse(JSON.parse(bytes.toString('utf8')));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
