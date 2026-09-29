// Читает content/*.md и собирает lib/content.generated.json:
// блоки, задания и критерии берутся прямо из markdown-таблиц.
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const dir = path.join(process.cwd(), 'content');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();

const TASK_RE = /^##\s+(\d+\.\d+)\.?\s+(.+?)\s*$/;
const RUBRIC_RE = /^\|\s*Критерий\s*\|/;
const INFO_NAMES = { readme: 'О программе', resources: 'Литература' };

const splitRow = (line) =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((s) => s.trim());
const clean = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

const blocks = files.map((file) => {
  const markdown = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = markdown.split(/\r?\n/);
  const slug = file.replace(/\.md$/, '').replace(/^\d+_/, '');
  const h1 = (lines.find((l) => /^#\s/.test(l)) || file).replace(/^#\s+/, '').trim();
  const metaMatch = h1.match(/\(([^)]+)\)\s*$/);
  const title = h1.replace(/\s*\([^)]*\)\s*$/, '');
  const short = INFO_NAMES[slug] || title.replace(/^Блок\s+\d+\.\s*/, '');

  const tasks = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TASK_RE);
    if (m) {
      cur = { id: `${slug}-${m[1]}`, num: m[1], title: clean(m[2]), criteria: [] };
      tasks.push(cur);
      continue;
    }
    if (RUBRIC_RE.test(lines[i])) {
      if (!cur) {
        cur = { id: slug, num: null, title: short, criteria: [] };
        tasks.push(cur);
      }
      i += 2; // заголовок таблицы и разделитель
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const c = splitRow(lines[i]);
        cur.criteria.push({ label: clean(c[0]), levels: [clean(c[1] ?? ''), clean(c[2] ?? ''), clean(c[3] ?? '')] });
        i++;
      }
      i--;
    }
  }
  for (const t of tasks) t.kind = t.criteria.length ? 'rubric' : 'check';

  let html = marked.parse(markdown, { gfm: true });
  html = html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<h2>(\d+\.\d+)\./g, '<h2 id="t-$1">$1.')
    .replace(/^\s*<h1>[\s\S]*?<\/h1>\s*(<hr>\s*)?/, '');

  return {
    slug,
    file,
    order: parseInt(file, 10) || 0,
    title,
    short,
    meta: metaMatch ? metaMatch[1] : null,
    isInfo: tasks.length === 0,
    markdown,
    html,
    tasks,
  };
});

fs.writeFileSync(
  path.join(process.cwd(), 'lib', 'content.generated.json'),
  JSON.stringify({ blocks }, null, 2)
);
const n = blocks.reduce((a, b) => a + b.tasks.length, 0);
console.log(`content: ${blocks.length} файлов, ${n} заданий`);
