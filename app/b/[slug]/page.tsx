import Link from 'next/link';
import { notFound } from 'next/navigation';
import { courseBlocks, getBlock } from '@/lib/content';
import { blockProgress, taskCells } from '@/lib/grading';
import { safeReadState } from '@/lib/store';
import { Squares } from '@/components/Squares';
import { StudentTask } from '@/components/StudentTask';
import { StoreError } from '@/components/StoreError';

export const dynamic = 'force-dynamic';

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();

  const download = (
    <a className="btn btn-quiet" href={`/download?file=${encodeURIComponent(block.file)}`}>
      Скачать {block.file}
    </a>
  );

  if (block.isInfo) {
    return (
      <div className="page-info">
        <h1 className="page-title">{block.title}</h1>
        <div className="page-actions">{download}</div>
        <article className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />
      </div>
    );
  }

  const { state, error } = await safeReadState();
  const p = blockProgress(block, state);
  const i = courseBlocks.findIndex((b) => b.slug === block.slug);
  const prev = courseBlocks[i - 1];
  const next = courseBlocks[i + 1];

  return (
    <>
      <StoreError error={error} />
      <div className="block-head">
        <p className="small muted">
          <Link href="/">Программа</Link> / {block.short}
        </p>
        <h1 className="page-title">{block.title}</h1>
        {block.meta && <p className="muted">{block.meta}</p>}
        <Squares size="lg" groups={block.tasks.map((t) => taskCells(t, state.tasks[t.id]))} />
        <div className="page-actions">
          <span className="small muted">
            Зачтено {p.passed} из {p.total}
          </span>
          <a className="btn btn-quiet mobile-only" href="#tasks">
            Задания и оценки
          </a>
          {download}
        </div>
      </div>

      <div className="block-layout">
        <article className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />
        <aside className="tasks" id="tasks" aria-label="Задания и оценки">
          {block.tasks.map((t) => (
            <StudentTask key={t.id} task={t} st={state.tasks[t.id]} />
          ))}
        </aside>
      </div>

      <nav className="pager">
        {prev ? <Link href={`/b/${prev.slug}`}>← {prev.short}</Link> : <span />}
        {next ? <Link href={`/b/${next.slug}`}>{next.short} →</Link> : <span />}
      </nav>
    </>
  );
}
