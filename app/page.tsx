import Link from 'next/link';
import { courseBlocks } from '@/lib/content';
import { blockProgress, evaluate, taskCells } from '@/lib/grading';
import { safeReadState } from '@/lib/store';
import { Squares } from '@/components/Squares';
import { StoreError } from '@/components/StoreError';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { state, error } = await safeReadState();
  const all = courseBlocks.flatMap((b) => b.tasks);
  const passed = all.filter((t) => evaluate(t, state.tasks[t.id]).status === 'passed').length;
  const next = courseBlocks
    .flatMap((b) => b.tasks.map((t) => ({ b, t, e: evaluate(t, state.tasks[t.id]) })))
    .find((x) => x.e.status !== 'passed' && x.b.slug !== 'references');

  return (
    <>
      <StoreError error={error} />
      <section className="hero">
        <h1>База дизайна</h1>
        <p className="lead">
          Композиция, типографика и цвет за 6–8 недель. Каждый квадрат — один критерий оценки:
          зелёный — выполнено, жёлтый — частично, красный — не выполнено.
        </p>
        <Squares size="lg" groups={courseBlocks.flatMap((b) => b.tasks.map((t) => taskCells(t, state.tasks[t.id])))} />
        <div className="overall">
          <div className="bar" aria-hidden>
            <span style={{ width: `${(passed / all.length) * 100}%` }} />
          </div>
          <p>
            Зачтено {passed} из {all.length} заданий
          </p>
        </div>
        {next && (
          <p className="next">
            Следующее:{' '}
            <Link href={`/b/${next.b.slug}#task-${next.t.id}`}>
              {next.t.num ? `${next.t.num}. ` : ''}
              {next.t.title}
            </Link>{' '}
            <StatusBadge status={next.e.status} />
          </p>
        )}
      </section>

      <ol className="blocks">
        {courseBlocks.map((b) => {
          const p = blockProgress(b, state);
          return (
            <li key={b.slug}>
              <Link href={`/b/${b.slug}`} className="block-row">
                <span className="block-name">
                  <strong>{b.short}</strong>
                  {b.meta && <span className="muted small">{b.meta}</span>}
                </span>
                <Squares groups={b.tasks.map((t) => taskCells(t, state.tasks[t.id]))} />
                <span className="block-count small">
                  {p.passed} из {p.total}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="downloads small">
        <a href="/download">Скачать все материалы (.zip)</a>
      </p>
    </>
  );
}
