import data from './content.generated.json';

export type Criterion = { label: string; levels: [string, string, string] };
export type Task = {
  id: string;
  num: string | null;
  title: string;
  criteria: Criterion[];
  kind: 'rubric' | 'check';
};
export type Block = {
  slug: string;
  file: string;
  order: number;
  title: string;
  short: string;
  meta: string | null;
  isInfo: boolean;
  markdown: string;
  html: string;
  tasks: Task[];
};

export const blocks = data.blocks as Block[];
export const courseBlocks = blocks.filter((b) => !b.isInfo);
export const infoBlocks = blocks.filter((b) => b.isInfo);

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug);
}

export function getTask(id: string) {
  for (const b of courseBlocks) {
    const t = b.tasks.find((t) => t.id === id);
    if (t) return { block: b, task: t };
  }
  return null;
}
