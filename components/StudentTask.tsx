import type { Task } from '@/lib/content';
import { evaluate, taskCells } from '@/lib/grading';
import type { TaskState } from '@/lib/types';
import { Squares } from './Squares';
import { StatusBadge } from './StatusBadge';
import { SubmitForm } from './SubmitForm';

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

export function StudentTask({ task, st }: { task: Task; st?: TaskState }) {
  const e = evaluate(task, st);
  return (
    <section className="task" id={`task-${task.id}`}>
      <header className="task-head">
        <h3>
          {task.num ? <a href={`#t-${task.num}`}>{task.num}. {task.title}</a> : task.title}
        </h3>
        <StatusBadge status={e.status} />
      </header>

      <Squares groups={[taskCells(task, st)]} />

      {task.kind === 'rubric' && e.filled > 0 && (
        <ul className="crit-list">
          {task.criteria.map((c) => {
            const s = st?.scores?.[c.label];
            return (
              <li key={c.label}>
                <span className={`sq ${s === undefined ? 'sq-empty' : `sq-${s}`}`} aria-hidden />
                <span>
                  {c.label}
                  {s !== undefined && <span className="muted"> — {c.levels[s]}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {task.kind === 'rubric' && e.filled === e.total && (
        <p className="muted small">Баллы: {e.sum} из {e.max}</p>
      )}

      {st?.comment && (
        <div className="comment">
          <p className="small muted">Комментарий ментора</p>
          <p>{st.comment}</p>
        </div>
      )}

      {st?.history?.length ? (
        <p className="small muted">
          {st.history.map((h) => `Попытка ${h.attempt}: ${h.sum} из ${h.max}`).join('; ')}
        </p>
      ) : null}

      {e.status !== 'passed' && (
        <details className="submit">
          <summary>
            {st?.submission ? `Сдано ${fmt(st.submission.at)}. Изменить` : 'Сдать работу'}
          </summary>
          <SubmitForm taskId={task.id} current={st?.submission} />
        </details>
      )}
    </section>
  );
}
