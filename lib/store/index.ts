import { isDatabaseConfigured } from '../config';
import { MemoryStore } from './memory';
import { PostgresStore } from './postgres';
import type { DataStore } from './types';

/**
 * একক স্টোর ইনস্ট্যান্স (HMR/সার্ভারলেস সেফ)।
 * DATABASE_URL বা POSTGRES_URL সেট করা থাকলে Postgres, নাহলে ইন-মেমরি।
 */
const globalForStore = globalThis as unknown as { __gbStore?: DataStore };

export function getStore(): DataStore {
  if (!globalForStore.__gbStore) {
    const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    globalForStore.__gbStore = conn ? new PostgresStore(conn) : new MemoryStore();
  }
  return globalForStore.__gbStore;
}

/** সব ডেটা-অ্যাক্সের আগে কল করতে হবে (টেবিল/সিড নিশ্চিত করে) */
export async function db(): Promise<DataStore> {
  const store = getStore();
  await store.init();
  return store;
}

export function storeKind(): 'memory' | 'postgres' {
  return getStore().kind;
}

export { isDatabaseConfigured };
