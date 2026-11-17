// Hello Interview practice problems: the System Design and AI Coding tabs of 刷题记录. The lists (32 System Design,
// 13 AI Coding) are in hello-interview-problems.json, read from hellointerview.com.
//   - each problem has its own tick in study-progress.json, "hi-sd.<slug>" or "hi-ai.<slug>", ticked in the tab on the day
//     it was practised; its label ends with that date ("System Design · Bitly · 2026-11-16"), shown next to the problem
//   - the plan days come from hello-interview.json: a day whose 题解 link is this problem and which also has a 练习题 link
//     practises it (安排); a day that only links its 题解 uses it as a reference (dashed chip). A chip turns green once that
//     day's 13:45 ☐ is ticked in the timetable; it does not tick the problem, the problem's own tick is separate
const fs = require('fs'), path = require('path');
const progress = require('./progress.cjs');
const hi = require('./hello-interview.cjs');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'hello-interview-problems.json'), 'utf8'));
const HI = 'https://www.hellointerview.com';
const DIFFS = ['Easy', 'Medium', 'Hard'];
const PLAN = ['已安排', '没安排'];
const TRACKS = [
  { tab: 'systemdesign', name: 'System Design', id: 'sd', kind: 'System Design', list: DATA.systemDesign,
    learn: '/learn/system-design/problem-breakdowns/', practice: p => HI + (p.guided ? '/practice/system-design/new/' + p.slug : '/practice/system-design') },
  { tab: 'aicoding', name: 'AI Coding', id: 'ai', kind: 'AI Coding', list: DATA.aiCoding,
    learn: '/learn/ai-coding/problem-breakdowns/', practice: () => HI + '/practice/ai-coding?format=structured' },
];
const KEY = /^hi-(?:sd|ai)\.[a-z0-9-]+$/;   // server.cjs accepts these besides the timetable's day keys
const pad = n => String(n).padStart(2, '0');
const isPractice = u => u.includes('/practice/');

for (const t of TRACKS) for (const p of t.list) {
  if (!KEY.test(`hi-${t.id}.${p.slug}`) || !DIFFS.includes(p.diff)) throw Error('hello-interview-problems: bad problem ' + p.slug);
}
// every problem breakdown linked from the plan must be in the lists (catches a typo in a slug)
for (const it of hi.DATA.items) for (const [, u] of it.links) {
  const t = TRACKS.find(t => u.startsWith(HI + t.learn));
  if (t && !t.list.some(p => u === HI + t.learn + p.slug)) throw Error('hello-interview: day ' + it.day + ' links an unknown problem ' + u);
}

// md: the timetable Markdown (with ☐/☑), for the 13:45 tick of each plan day
function tracks(md) {
  const ticks = progress.load().ticks;
  const days = new Map(hi.items(md).map(x => [x.day, { day: x.day, keys: x.keys, done: x.done, what: `${x.kind}：${x.title}` }]));
  return TRACKS.map(t => {
    const items = t.list.map(p => {
      const key = `hi-${t.id}.${p.slug}`, url = HI + t.learn + p.slug, plan = [], ref = [];
      for (const it of hi.DATA.items) {
        if (!it.links.some(([, u]) => u === url)) continue;
        (it.links.some(([, u]) => isPractice(u)) ? plan : ref).push(days.get(it.day));
      }
      const label = ticks[key] || '', when = (label.match(/(\d{4}-\d{2}-\d{2})$/) || [, ''])[1];
      return { ...p, key, url, practiceUrl: t.practice(p), plan, ref, done: !!ticks[key], when, label: `${t.name} · ${p.title}`,
        planned: plan.length ? PLAN[0] : PLAN[1] };
    });
    // the track's days with no problem of its own: pick one from the list (练习题 link only), or a scenario of the plan's own
    const mine = hi.DATA.items.filter(it => it.kind === t.kind);
    const own = it => it.links.some(([, u]) => u.startsWith(HI + t.learn));
    const pick = mine.filter(it => !own(it) && it.links.every(([, u]) => isPractice(u))).map(it => it.day);
    const scenario = mine.filter(it => !it.links.some(([, u]) => isPractice(u))).map(it => it.day);
    return { ...t, items, pick, scenario };
  });
}

// one problem of a tab (an <li> of top150-record's columns): checkbox, title (its 题解), date practised, plan days, 练习
function item(p, esc) {
  const md = d => (d ? `${+d.slice(5, 7)}/${+d.slice(8)}` : '');
  const chip = (d, ref) => `<a class="rec-day${d.done ? ' ok' : ''}${ref ? ' ref' : ''}" href="AI_ENGINEER_TRANSITION_PLAN.html#day-${pad(d.day)}" target="_blank" rel="noopener" data-keys="${esc(d.keys.join(' '))}"${d.done ? ' data-built="1"' : ''} title="${esc(`Day ${pad(d.day)} · ${d.what}${ref ? '（只拿这道题的题解作参考）' : '（时间表这天 13:45 勾过就变绿）'}`)}">D${pad(d.day)}</a>`;
  return `<li class="rec-p rec-tk${p.done ? ' done' : ''}" data-keys="${esc(p.key)}" data-diff="${esc(p.diff)}" data-plan="${esc(p.planned)}" data-label="${esc(p.label)}" data-when="${esc(p.when)}">`
    + `<label class="rec-ck"><input type="checkbox" class="rec-box" aria-label="练过 ${esc(p.title)}"${p.done ? ' checked' : ''}></label>`
    + `<span class="rec-title"><a href="${esc(p.url)}" target="_blank" rel="noopener" title="题解">${esc(p.title)}</a></span>`
    + `<span class="rec-meta"><span class="rec-when">${p.done ? md(p.when) : ''}</span>${[...p.plan.map(d => chip(d)), ...p.ref.map(d => chip(d, true))].join('')}`
    + `<a class="rec-go" href="${esc(p.practiceUrl)}" target="_blank" rel="noopener">练习</a></span></li>`;
}

// the line under a tab's summary: what the plan does with this list
function note(t) {
  const days = ds => ds.map(d => 'Day ' + pad(d)).join('、');
  const planned = t.items.filter(p => p.plan.length).length;
  return `<p class="rec-note muted">共 ${t.items.length} 道，时间表里专门安排了 ${planned} 道，还有 ${t.items.length - planned} 道没安排。题目链接是题解，“练习”是 Hello Interview 的练习页。`
    + `D 标签是计划做这道题的那天，时间表那天 13:45 勾过就变绿；虚线的是那天只拿它的题解作参考。`
    + (t.pick.length ? `${days(t.pick)} 是从题库自己选题或重做弱项，做了哪道就在这里勾上。` : '')
    + (t.scenario.length ? `${days(t.scenario)} 是计划自拟场景的限时 Mock，不对应题库里的题。` : '')
    + `练过一道就勾上，会记下勾的日期；这里的勾和时间表 13:45 那一格是分开的。</p>`;
}

const style = `<style>
li.rec-tk{flex-wrap:wrap}
li.rec-tk .rec-ck{width:1.15em}
li.rec-tk .rec-title{min-width:7.5em}
li.rec-tk .rec-meta{margin-left:auto}
.rec-box{width:1em;height:1em;margin:0;vertical-align:-.14em;accent-color:#2da44e;cursor:pointer}
.rec-meta .rec-when{color:#116329;margin-right:4px}
.rec-meta .rec-when:empty{display:none}
a.rec-day{display:inline-block;margin-left:3px;padding:0 3px;border:1px solid #c9d6de;border-radius:4px;line-height:1.3;color:#4b5b66}
a.rec-day.ref{border-style:dashed;color:#7f8f9a}
a.rec-day.ok{background:#2da44e;border-color:#2da44e;color:#fff}
a.rec-go{margin-left:6px}
</style>`;

module.exports = { DATA, DIFFS, PLAN, TRACKS, KEY, tracks, item, note, style };
