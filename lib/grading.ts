import type { Block, Task } from './content';
import type { Score, State, TaskState } from './types';

export const PASS_RATIO = 0.7;

export type Status = 'todo' | 'submitted' | 'progress' | 'passed' | 'failed';

export const STATUS_LABEL: Record<Status, string> = {
  todo: 'Не начато',
  submitted: 'Сдано на проверку',
  progress: 'Проверяется',
  passed: 'Зачтено',
  failed: 'На переделку',
};

export function evaluate(task: Task, st?: TaskState) {
  const scores = st?.scores ?? {};
  const needsReview =
    !!st?.submission && (!st.gradedAt || st.submission.at > st.gradedAt);

  if (task.kind === 'check') {
    const done = !!st?.done;
    const status: Status = done ? 'passed' : st?.submission ? 'submitted' : 'todo';
    return { status, sum: done ? 1 : 0, max: 1, filled: done ? 1 : 0, total: 1, needsReview: needsReview && !done };
  }

  const values = task.criteria
    .map((c) => scores[c.label])
    .filter((v): v is Score => v === 0 || v === 1 || v === 2);
  const total = task.criteria.length;
  const filled = values.length;
  const sum = values.reduce<number>((a, b) => a + b, 0);
  const max = total * 2;

  let status: Status;
  if (filled === 0) status = st?.submission ? 'submitted' : 'todo';
  else if (filled < total) status = 'progress';
  else if (values.includes(0) || sum < max * PASS_RATIO) status = 'failed';
  else status = 'passed';

  return { status, sum, max, filled, total, needsReview };
}

export type Cell = { score: Score | null; title: string };

export function taskCells(task: Task, st?: TaskState): Cell[] {
  if (task.kind === 'check') {
    return [{ score: st?.done ? 2 : null, title: task.title }];
  }
  return task.criteria.map((c) => ({
    score: st?.scores?.[c.label] ?? null,
    title: `${task.num ? task.num + ' · ' : ''}${c.label}`,
  }));
}

export function blockProgress(block: Block, state: State) {
  const evals = block.tasks.map((t) => evaluate(t, state.tasks[t.id]));
  return {
    passed: evals.filter((e) => e.status === 'passed').length,
    total: block.tasks.length,
    review: evals.filter((e) => e.needsReview).length,
  };
}

export function passThreshold(task: Task) {
  return Math.ceil(task.criteria.length * 2 * PASS_RATIO);
}
