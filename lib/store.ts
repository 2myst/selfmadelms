import { Redis } from '@upstash/redis';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { State, TaskState } from './types';

const KEY = 'lms:state';
const FILE = path.join(process.cwd(), '.data', 'state.json');

export class StoreNotConfigured extends Error {
  constructor() {
    super('Хранилище не подключено. Подключите Upstash Redis в настройках проекта на Vercel (Storage → Upstash).');
  }
}

function redis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function readState(): Promise<State> {
  const r = redis();
  if (r) return (await r.get<State>(KEY)) ?? { tasks: {} };
  if (process.env.VERCEL) throw new StoreNotConfigured();
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as State;
  } catch {
    return { tasks: {} };
  }
}

async function writeState(state: State) {
  const r = redis();
  if (r) {
    await r.set(KEY, state);
    return;
  }
  if (process.env.VERCEL) throw new StoreNotConfigured();
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state, null, 2));
}

export async function safeReadState(): Promise<{ state: State; error: string | null }> {
  try {
    return { state: await readState(), error: null };
  } catch (e) {
    return { state: { tasks: {} }, error: e instanceof Error ? e.message : 'Не удалось прочитать прогресс' };
  }
}

export async function updateTask(id: string, fn: (t: TaskState) => TaskState | null) {
  const state = await readState();
  const next = fn(state.tasks[id] ?? { scores: {} });
  if (next === null) delete state.tasks[id];
  else state.tasks[id] = next;
  await writeState(state);
}
