// Hello Interview: the 2-hour System Design + AI Coding block of the timetable (13:45–15:45) and the Hello Interview tab
// of 刷题记录. The plan is in hello-interview.json:
//   - Day 01–03: the block used to be General & AI System Design; a day where that was ticked keeps it, the others skip
//   - Day 04–33: the 30-day plan in its own order (hi = its own Day 01–30, day = hi + 3): Day 04 Delivery Framework,
//     Day 05 Design Bitly, ...; its weeks start on a Thursday, so they are shown with their day range, not as "this week"
//   - Day 34–35: 查漏 (Core Concepts, Key Technologies, the AI Coding process)
//   - Day 36–45: new problems, then redoing the weakest ones
// Each day has one ☐ for the day ("<kind>：<title>"); the record tab shows which days are ticked.
// Hello Interview's learning pages (System Design: Core Concepts, Patterns, Key Technologies; AI Coding: Common Patterns)
// are the "learn" list of hello-interview-problems.json, and each problem lists the pages its breakdown uses ("uses").
// A day's "learn" are the pages read that day before its problem, each read once, on or before the first day whose
// problem uses it. The cell starts with them under "Material", one line and ☐ each,
// "Handling Large Blobs (20mins)（本地连接 · Summary）" (30 minutes for one page, 20 each for more), then under "Review"
// the pages the day's problems use that were read on an earlier day, with that day (no ☐, no time), then the day's ☐
// line with the rest of the 2 hours ("System Design：Design Dropbox (80mins)"), its task, and its links on one line in
// ［ ］. build.cjs shows Material and Review in a left column (layout below).
// Titles link to the website as before. After an article (讲义) or a problem breakdown (题解) that has a local copy in
// hello-interview-local.json (resource/, downloaded pages; in git except the videos and the pages over 100 MB, see .gitignore) comes （本地连接）, and after an article with a
// summary note in the Obsidian vault also Summary, linked to the note's HTML copy (summaries.cjs):
// "[Scaling Reads](web)（[本地连接](local) · [Summary](resource/Summary/...html)）".
// build.cjs writes the row with the block's old time (14:15–15:00) like the other rows, then moves it to 13:45–15:45.
const fs = require('fs'), path = require('path');
const progress = require('./progress.cjs');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'hello-interview.json'), 'utf8'));
const byDay = new Map(DATA.items.map(it => [it.day, it]));
const SECTION = new Map(DATA.sections.map(s => [s.id, s]));
const FIRST = Math.min(...byDay.keys());
const TIME = '13:45';   // where the block ends up in the timetable
const pad = n => String(n).padStart(2, '0');
const GROUP = { 'System Design': 'System Design', 'AI Coding': 'AI Coding', '基础': '基础与复盘', '复盘': '基础与复盘' };
const GROUPS = ['System Design', 'AI Coding', '基础与复盘'];
const TICK = new RegExp(`^(?:${Object.keys(GROUP).join('|')})：`);   // the day's ☐ line

if (DATA.items.length !== byDay.size) throw Error('hello-interview: two items on the same day');
for (const it of DATA.items) {
  if (!SECTION.has(it.section) || !GROUP[it.kind] || !it.links.length) throw Error('hello-interview: bad item on day ' + it.day);
  if (/\|/.test(it.task + it.title + it.links.flat().join(''))) throw Error('hello-interview: "|" would break the table, day ' + it.day);
}

// learning pages: id -> page, the day it is read, and the pages each problem breakdown (by URL) uses
const PROBS = JSON.parse(fs.readFileSync(path.join(__dirname, 'hello-interview-problems.json'), 'utf8'));
const HI = 'https://www.hellointerview.com';
const PAGE = new Map(PROBS.learn.map(p => [p.id, p]));
const USES = new Map([...PROBS.systemDesign.map(p => [`${HI}/learn/system-design/problem-breakdowns/${p.slug}`, p.uses]),
  ...PROBS.aiCoding.map(p => [`${HI}/learn/ai-coding/problem-breakdowns/${p.slug}`, p.uses])]);
for (const [u, ids] of USES) for (const id of ids || []) if (!PAGE.has(id)) throw Error('hello-interview: ' + u + ' uses an unknown page ' + id);
const LEARNED = new Map();
for (const it of DATA.items) for (const id of it.learn || []) {
  if (!PAGE.has(id)) throw Error('hello-interview: day ' + it.day + ' reads an unknown page ' + id);
  if (LEARNED.has(id)) throw Error('hello-interview: page read twice: ' + id);
  LEARNED.set(id, it.day);
}
for (const id of PAGE.keys()) if (!LEARNED.has(id)) throw Error('hello-interview: page never read: ' + id);
const uses = it => [...new Set(it.links.flatMap(([, u]) => USES.get(u) || []))];
for (const it of DATA.items) for (const id of uses(it)) {
  if (LEARNED.get(id) > it.day) throw Error(`hello-interview: day ${it.day} uses ${id}, which is read later (day ${LEARNED.get(id)})`);
}
const readMins = it => ((it.learn || []).length === 1 ? 30 : 20);

// local copies of the articles and problem breakdowns, and the articles' summaries
const LOCAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'hello-interview-local.json'), 'utf8'));
const article = u => !/\/problem-breakdowns\/|\/practice\//.test(u);
const KNOWN = new Set([...PROBS.learn.map(p => p.url), ...USES.keys(), ...DATA.items.flatMap(it => it.links.map(([, u]) => u)).filter(article)]);
for (const u of Object.keys(LOCAL.pages)) if (!KNOWN.has(u)) throw Error('hello-interview-local: not a page of the plan: ' + u);
for (const id of Object.keys(LOCAL.summary)) if (!PAGE.has(id)) throw Error('hello-interview-local: summary of an unknown page ' + id);
// a path as a URL: each folder and file name encoded, also ' ( ) (they end a link in layout.cjs and Markdown); "#section" kept
const enc = p => { const [f, h] = p.split('#'); return f.split('/').map(s => encodeURIComponent(s).replace(/['()!*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())).join('/') + (h ? '#' + h : ''); };
const localOf = u => (LOCAL.pages[u] ? enc(LOCAL.pages[u]) : '');
// a summary note: its HTML copy made by summaries.cjs (resource/Summary/<vault folder>/<note>.html, root-relative),
// what "Summary" links to; and the note itself in Obsidian (obsidian://), linked from that page
const summaryHtml = id => (LOCAL.summary[id] ? `resource/Summary/${path.posix.basename(path.posix.dirname(LOCAL.summary[id]))}/${path.posix.basename(LOCAL.summary[id], '.md')}.html` : '');
const summaryOf = id => (LOCAL.summary[id] ? enc(summaryHtml(id)) : '');
const obsidianOf = id => (LOCAL.summary[id] ? `obsidian://open?vault=${encodeURIComponent(LOCAL.vault)}&file=${encodeURIComponent(LOCAL.summary[id].replace(/\.md$/, ''))}` : '');
// （本地连接 · Summary） after a title, or '' when there is neither; "before" goes first inside the brackets
const extras = (u, id, before = []) => {
  const alt = [...before, ...(localOf(u) ? [`[本地连接](${localOf(u)})`] : []), ...(id && summaryOf(id) ? [`[Summary](${summaryOf(id)})`] : [])];
  return alt.length ? `（${alt.join(' · ')}）` : '';
};
const titled = (title, u, id, before) => `[${title}](${u})` + extras(u, id, before);
const pageLink = id => titled(PAGE.get(id).title, PAGE.get(id).url, id);
// one line per page: "[Handling Large Blobs](web) (20mins)（[本地连接](local) · [Summary](note)） ☐"
const learnLines = it => (it.learn || []).map(id => `[${PAGE.get(id).title}](${PAGE.get(id).url}) (${readMins(it)}mins)${extras(PAGE.get(id).url, id)} ☐`);
// the pages the day's problems use that were read on an earlier day, one line each:
// "[Scaling Reads](web)（Day 05 学过 · [本地连接](local) · [Summary](note)）"
const reviewLines = it => uses(it).filter(id => !(it.learn || []).includes(id)).sort((a, b) => LEARNED.get(a) - LEARNED.get(b))
  .map(id => titled(PAGE.get(id).title, PAGE.get(id).url, id, [`Day ${pad(LEARNED.get(id))} 学过`]));
// the minutes left for the problem (or the rest of a 基础 / 复盘 day) after the reading, or 0 when the day reads nothing
const restMins = it => ((it.learn || []).length ? 120 - (it.learn || []).length * readMins(it) : 0);

// the text of the day's ☐ line: kind and title, without the 30-day plan's own day number, then the minutes left after
// the reading: "System Design：Design Dropbox (80mins)"
const tickText = it => `${it.kind}：${it.title}${restMins(it) ? ` (${restMins(it)}mins)` : ''}`;
const sectionDays = id => { const ds = DATA.items.filter(it => it.section === id).map(it => it.day); return `Day ${pad(Math.min(...ds))}–${pad(Math.max(...ds))}`; };

// The day's links, on one line in full-width brackets (a "[" would start a Markdown link): 讲义 (other reading, such as
// the Delivery Framework; the learning pages are the Material lines), 题解 (problem breakdowns), 练习题 (practice),
// separated by "，": "［题解：Dropbox（本地连接），练习题：Guided Practice］". Link titles in the JSON are the bare names;
// the label says what they are.
const KINDS = [['讲义', article], ['题解', u => /\/problem-breakdowns\//.test(u)], ['练习题', u => /\/practice\//.test(u)]];
const linkLine = it => {
  const s = KINDS.map(([label, is]) => {
    const ls = it.links.filter(([, u]) => is(u));
    return ls.length ? `${label}：${ls.map(([t, u]) => titled(t, u)).join(' · ')}` : '';
  }).filter(Boolean).join('，');
  return s ? `［${s}］` : '';
};

// the day's row, as Markdown; old = { part, done }: the General & AI System Design item this day used to have
function row(day, old) {
  const head = '| 14:15–15:00 | Hello Interview，2 小时 | ', it = byDay.get(day);
  const start = `Hello Interview 从 [Day ${pad(FIRST)}](#day-${pad(FIRST)}) 开始`;
  if (!it) {
    if (day > FIRST) throw Error('hello-interview: nothing planned on day ' + day);
    return head + (old && old.done ? `${old.part}<br>这一格原来是 General & AI System Design，这天已经做完；${start} |` : `跳过：这一格原来是 General & AI System Design，${start} |`);
  }
  const learn = learnLines(it), review = reviewLines(it);
  return head + [...(learn.length ? ['Material', ...learn] : []), ...(review.length ? ['Review', ...review] : []),
    `${tickText(it)} ☐`, it.task, linkLine(it)].filter(Boolean).join('<br>') + ' |';
}
// how build.cjs lays out a 13:45 cell (its Markdown parts): the labels Material and Review in the left column with their
// lines on the right, the day's ☐ line (bold) and its task across both columns, the links on the right with "［" hanging
// in front, so "题解" lines up with the titles above
const LABELS = new Set(['Material', 'Review']);
function layout(parts) {
  const at = parts.findIndex(p => TICK.test(p));
  if (at < 0) return null;
  return parts.map((p, i) => (i < at ? (LABELS.has(p) ? 'label' : 'item') : i === at ? 'head' : p.startsWith('［') ? 'link' : 'full'));
}
// 学习提示 lines (ending with a newline), or ''
function tip(day) {
  const it = byDay.get(day);
  if (!it) return '';
  const sec = SECTION.get(it.section), first = DATA.items.find(x => x.section === it.section).day === day;
  // a System Design day with two problems (two problem breakdowns) splits the 2 hours between them
  const two = it.kind === 'System Design' && it.links.filter(([, u]) => u.includes('/system-design/problem-breakdowns/')).length > 1;
  const review = reviewLines(it).length ? 'Review 下面是以前读过、今天的题也用到的讲义，做题前翻一下就行，不另算时间。' : '';
  return (first ? `- Hello Interview 目标（${sec.name}，${sectionDays(it.section)}）：${sec.goal}\n` : '') + `- Hello Interview：${DATA.method[two ? 'System Design 两道' : it.kind]}。${review}${DATA.record}\n`;
}
// the "今天学习 Topic" entry, or ''
function topic(day) {
  const it = byDay.get(day);
  return it ? `${it.kind} · [${it.title}](${mainLink(it)})` : '';
}
// where the day's title links to: its (first) problem breakdown, otherwise its first link
const mainLink = it => (it.links.find(([, u]) => u.includes('/problem-breakdowns/')) || it.links[0])[1];

// the record tab's items, with their tick keys read from the timetable Markdown (☐/☑)
function items(md) {
  const found = new Map();
  for (const [, day, block] of md.matchAll(/<a id="(day-\d+)"><\/a>([\s\S]*?)(?=<a id="day-|$)/g)) {
    const line = block.split('\n').find(l => l.startsWith('| ' + TIME));
    const part = line && (line.slice(1, -1).split('|')[2] || '').trim().split('<br>').find(p => TICK.test(p) && /[☐☑]/.test(p));
    if (part) found.set(+day.slice(4), { keys: [progress.keyOf(day, part)], done: part.includes('☑') });
  }
  return DATA.items.map(it => {
    const f = found.get(it.day);
    if (!f) throw Error('hello-interview: no ☐ for day ' + it.day + ' in the timetable');
    return { ...it, ...f, group: GROUP[it.kind], section: `${SECTION.get(it.section).name} · ${sectionDays(it.section)}` };
  });
}

module.exports = { DATA, FIRST, TIME, GROUPS, PAGE, LEARNED, LOCAL, row, tip, topic, items, mainLink, localOf, summaryOf, summaryHtml, obsidianOf, enc, layout };
