import Link from 'next/link';
import { courseBlocks } from '@/lib/content';
import { blockProgress, evaluate, taskCells } from '@/lib/grading';
import { safeReadState } from '@/lib/store';
import { logout } from '@/app/actions';
import { ManageTask } from '@/components/ManageTask';
import { Squares } from '@/components/Squares';
import { StoreError } from '@/components/StoreError';

export const dynamic = 'force-dynamic';

export default async function Manage() {
  const { state, error } = await safeReadState();
  const review = courseBlocks.flatMap((b) =>
    b.tasks.filter((t) => evaluate(t, state.tasks[t.id]).needsReview).map((t) => ({ b, t }))
  );

  return (
    <>
      <StoreError error={error} />
      <div className="manage-head">
        <h1>Панель ментора</h1>
        <form action={logout}>
          <button className="btn btn-quiet" type="submit">Выйти</button>
        </form>
      </div>

      <section className="review">
        <h2>Ждут проверки</h2>
        {review.length === 0 ? (
          <p className="muted">Новых сдач нет. Когда ученик отправит работу, она появится здесь.</p>
        ) : (
          <ul>
            {review.map(({ b, t }) => (
              <li key={t.id}>
                <a href={`#task-${t.id}`}>
                  {b.short}: {t.num ? `${t.num}. ` : ''}
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {courseBlocks.map((b) => {
        const p = blockProgress(b, state);
        return (
          <section className="mblock" key={b.slug}>
            <div className="mblock-head">
              <h2>
                <Link href={`/b/${b.slug}`}>{b.short}</Link>
              </h2>
              <span className="small muted">
                Зачтено {p.passed} из {p.total}
              </span>
            </div>
            <Squares groups={b.tasks.map((t) => taskCells(t, state.tasks[t.id]))} />
            {b.tasks.map((t) => (
              <ManageTask key={t.id} task={t} st={state.tasks[t.id]} />
            ))}
          </section>
        );
      })}
    </>
  );
}
