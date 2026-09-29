'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { COOKIE, isAdminToken, tokenFor } from '@/lib/auth';
import { getTask } from '@/lib/content';
import { evaluate } from '@/lib/grading';
import { updateTask } from '@/lib/store';
import type { Score } from '@/lib/types';

type Result = { ok: boolean; error?: string };

async function requireAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!(await isAdminToken(value))) throw new Error('Нет доступа');
}

function requireTask(id: string) {
  const found = getTask(id);
  if (!found) throw new Error('Задание не найдено');
  return found;
}

function refresh() {
  revalidatePath('/', 'layout');
}

async function run(fn: () => Promise<void>): Promise<Result> {
  try {
    await fn();
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Не удалось сохранить' };
  }
}

/* ---------- Вход ментора ---------- */

export async function login(_: Result | null, form: FormData): Promise<Result> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return { ok: false, error: 'На сервере не задан ADMIN_PASSWORD.' };
  if (String(form.get('password') ?? '') !== pw) return { ok: false, error: 'Неверный пароль.' };
  (await cookies()).set(COOKIE, await tokenFor(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
  redirect('/manage');
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect('/');
}

/* ---------- Ученик ---------- */

export async function submitWork(taskId: string, _: Result | null, form: FormData): Promise<Result> {
  const link = String(form.get('link') ?? '').trim();
  const note = String(form.get('note') ?? '').trim();
  if (!/^https?:\/\/\S+$/i.test(link)) return { ok: false, error: 'Вставьте ссылку, которая начинается с http:// или https://' };
  if (link.length > 500 || note.length > 1500) return { ok: false, error: 'Слишком длинный текст.' };
  return run(async () => {
    requireTask(taskId);
    await updateTask(taskId, (t) => ({ ...t, submission: { link, note, at: new Date().toISOString() } }));
  });
}

/* ---------- Ментор ---------- */

export async function setScore(taskId: string, label: string, score: Score | null): Promise<Result> {
  return run(async () => {
    await requireAdmin();
    const { task } = requireTask(taskId);
    if (!task.criteria.some((c) => c.label === label)) throw new Error('Критерий не найден');
    await updateTask(taskId, (t) => {
      const scores = { ...t.scores };
      if (score === null) delete scores[label];
      else scores[label] = score;
      return { ...t, scores, gradedAt: new Date().toISOString() };
    });
  });
}

export async function setDone(taskId: string, done: boolean): Promise<Result> {
  return run(async () => {
    await requireAdmin();
    requireTask(taskId);
    await updateTask(taskId, (t) => ({ ...t, done, gradedAt: new Date().toISOString() }));
  });
}

export async function saveComment(taskId: string, comment: string): Promise<Result> {
  return run(async () => {
    await requireAdmin();
    requireTask(taskId);
    await updateTask(taskId, (t) => ({ ...t, comment: comment.slice(0, 3000) }));
  });
}

export async function newAttempt(taskId: string): Promise<Result> {
  return run(async () => {
    await requireAdmin();
    const { task } = requireTask(taskId);
    await updateTask(taskId, (t) => {
      const e = evaluate(task, t);
      const attempt = t.attempt ?? 1;
      return {
        ...t,
        scores: {},
        done: false,
        attempt: attempt + 1,
        history: [...(t.history ?? []), { attempt, sum: e.sum, max: e.max, at: new Date().toISOString() }],
        submission: undefined,
        gradedAt: undefined,
      };
    });
  });
}

export async function resetTask(taskId: string): Promise<Result> {
  return run(async () => {
    await requireAdmin();
    requireTask(taskId);
    await updateTask(taskId, () => null);
  });
}
