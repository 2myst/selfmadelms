'use client';

import { useState, useTransition } from 'react';
import type { Task } from '@/lib/content';
import { evaluate, passThreshold } from '@/lib/grading';
import type { Score, TaskState } from '@/lib/types';
import { newAttempt, resetTask, saveComment, setDone, setScore } from '@/app/actions';
import { StatusBadge } from './StatusBadge';

export function ManageTask({ task, st }: { task: Task; st?: TaskState }) {
  const [local, setLocal] = useState<TaskState>(st ?? { scores: {} });
  const [comment, setComment] = useState(st?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const e = evaluate(task, local);

  const call = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? null : r.error ?? 'Ошибка');
      if (r.ok) after?.();
    });

  const pick = (label: string, value: Score) => {
    const next = local.scores[label] === value ? null : value;
    const scores = { ...local.scores };
    if (next === null) delete scores[label];
    else scores[label] = next;
    setLocal({ ...local, scores });
    call(() => setScore(task.id, label, next));
  };

  return (
    <details className="mtask" id={`task-${task.id}`} open={e.needsReview || e.status === 'progress'}>
      <summary>
        <span className="mtask-title">
          {task.num ? `${task.num}. ` : ''}
          {task.title}
        </span>
        {e.needsReview && <span className="badge badge-submitted">Новая сдача</span>}
        <StatusBadge status={e.status} />
        {task.kind === 'rubric' && (
          <span className="small muted tabular">
            {e.sum} / {e.max}
          </span>
        )}
      </summary>

      <div className="mtask-body">
        {local.submission && (
          <div className="submission">
            <a href={local.submission.link} target="_blank" rel="noreferrer">
              Открыть работу
            </a>
            <span className="small muted">
              {' '}
              сдано {new Date(local.submission.at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            {local.submission.note && <p className="small">{local.submission.note}</p>}
          </div>
        )}

        {task.kind === 'rubric' ? (
          <>
            <div className="rubric" role="table">
              {task.criteria.map((c) => (
                <div className="rubric-row" role="row" key={c.label}>
                  <div className="rubric-label" role="rowheader">
                    {c.label}
                  </div>
                  {([0, 1, 2] as Score[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="cell"
                      className={`score score-${v}`}
                      aria-pressed={local.scores[c.label] === v}
                      onClick={() => pick(c.label, v)}
                    >
                      <span className="score-num">{v}</span>
                      <span className="score-text">{c.levels[v]}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <p className="small muted">
              Зачёт: нет нулей и не меньше {passThreshold(task)} из {e.max}. Повторный клик снимает оценку.
            </p>
          </>
        ) : (
          <label className="check">
            <input
              type="checkbox"
              checked={!!local.done}
              onChange={(ev) => {
                const done = ev.target.checked;
                setLocal({ ...local, done });
                call(() => setDone(task.id, done));
              }}
            />
            Выполнено
          </label>
        )}

        <label className="comment-field">
          Комментарий для ученика
          <textarea rows={3} value={comment} onChange={(ev) => { setComment(ev.target.value); setSaved(false); }} />
        </label>

        <div className="row">
          <button type="button" className="btn" disabled={pending} onClick={() => call(() => saveComment(task.id, comment), () => setSaved(true))}>
            Сохранить комментарий
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={pending}
            onClick={() => {
              if (confirm('Сохранить результат в историю и начать новую попытку?')) {
                call(() => newAttempt(task.id), () => setLocal({ ...local, scores: {}, done: false, submission: undefined }));
              }
            }}
          >
            Новая попытка
          </button>
          <button
            type="button"
            className="btn btn-quiet btn-danger"
            disabled={pending}
            onClick={() => {
              if (confirm('Удалить все оценки, комментарий и сдачи по заданию?')) {
                call(() => resetTask(task.id), () => { setLocal({ scores: {} }); setComment(''); });
              }
            }}
          >
            Сбросить
          </button>
          {pending && <span className="small muted">Сохраняю…</span>}
          {saved && !pending && <span className="note-ok">Сохранено</span>}
          {error && <span className="note-err">{error}</span>}
        </div>

        {local.attempt && local.attempt > 1 ? (
          <p className="small muted">
            Сейчас попытка {local.attempt}.{' '}
            {local.history?.map((h) => `Попытка ${h.attempt}: ${h.sum} из ${h.max}`).join('; ')}
          </p>
        ) : null}
      </div>
    </details>
  );
}
