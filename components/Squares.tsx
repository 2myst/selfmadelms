import type { Cell } from '@/lib/grading';

const TEXT = ['не выполнено', 'частично', 'выполнено'];

export function Squares({ groups, size = 'md' }: { groups: Cell[][]; size?: 'md' | 'lg' }) {
  return (
    <div className={`squares squares-${size}`} role="img" aria-label={summary(groups)}>
      {groups.map((cells, gi) => (
        <span className="sq-group" key={gi}>
          {cells.map((c, i) => (
            <span
              key={i}
              className={`sq ${c.score === null ? 'sq-empty' : `sq-${c.score}`}`}
              title={`${c.title}: ${c.score === null ? 'не оценено' : TEXT[c.score]}`}
            />
          ))}
        </span>
      ))}
    </div>
  );
}

function summary(groups: Cell[][]) {
  const all = groups.flat();
  const n = (s: number) => all.filter((c) => c.score === s).length;
  return `Критериев: ${all.length}. Выполнено: ${n(2)}, частично: ${n(1)}, не выполнено: ${n(0)}.`;
}
