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

// The learning pages (讲义) of a track, for the tracker at the top of its tab: System Design's Core Concepts, Patterns and
// Key Technologies, AI Coding's Common Patterns (DATA.learn). Each has the tick of its line in the timetable's 13:45 row,
// so ticking it here or there is the same tick, the day it is read, and its 网页 / 本地连接 / Summary links.
function articles(md, t) {
  const found = new Map();   // page url -> its tick in the timetable
  for (const [, day, block] of md.matchAll(/<a id="(day-\d+)"><\/a>([\s\S]*?)(?=<a id="day-|$)/g)) {
    const line = block.split('\n').find(l => l.startsWith('| ' + hi.TIME));
    if (!line) continue;
    for (const part of (line.slice(1, -1).split('|')[2] || '').trim().split('<br>')) {
      const m = part.match(/^\[[^\]]+\]\((https:\/\/www\.hellointerview\.com\/[^)]+)\) \(\d+mins\)/);
      if (m && /[☐☑]/.test(part)) found.set(m[1], { key: progress.keyOf(day, part), label: progress.strip(part), done: part.includes('☑') });
    }
  }
  const prefix = t.name + ' · ';
  return DATA.learn.filter(p => p.group.startsWith(prefix)).map(p => {
    if (!found.has(p.url)) throw Error('hi-problems: no ☐ for the page ' + p.title + ' in the timetable');
    return { ...p, ...found.get(p.url), section: p.group.slice(prefix.length), day: hi.LEARNED.get(p.id) };
  });
}
// the tracker: read / all, a bar, and one card per group, in the order the pages are read
function articleBox(list, esc) {
  const pct = (d, n) => (n ? 100 * d / n : 0).toFixed(1) + '%', done = list.filter(p => p.done).length;
  const li = p => {
    const links = [hi.localOf(p.url) && `<a href="${esc(hi.localOf(p.url))}" target="_blank" rel="noopener">本地连接</a>`,
      hi.summaryOf(p.id) && `<a href="${esc(hi.summaryOf(p.id))}" target="_blank" rel="noopener">Summary</a>`].filter(Boolean).join(' · ');
    return `<li class="hl-p${p.done ? ' done' : ''}" data-key="${esc(p.key)}" data-label="${esc(p.label)}"${p.done ? ' data-built="1"' : ''}>`
      + `<label class="hl-ck"><input type="checkbox" aria-label="读完 ${esc(p.title)}"${p.done ? ' checked' : ''}></label>`
      + `<span class="hl-t"><a href="${esc(p.url)}" target="_blank" rel="noopener" title="Hello Interview 网页">${esc(p.title)}</a></span>`
      + `<span class="hl-meta">${links}<a class="hl-day" href="AI_ENGINEER_TRANSITION_PLAN.html#day-${pad(p.day)}" target="_blank" rel="noopener" title="Day ${pad(p.day)} 读这篇">D${pad(p.day)}</a></span></li>`;
  };
  const col = s => {
    const ps = list.filter(p => p.section === s).sort((a, b) => a.day - b.day), d = ps.filter(p => p.done).length;
    return `<section class="hl-col"><h2><span>${esc(s)}</span><span class="hl-n"><span class="hl-c">${d}</span> / ${ps.length}</span></h2>`
      + `<div class="hl-bar"><span style="width:${pct(d, ps.length)}"></span></div><ul>${ps.map(li).join('')}</ul></section>`;
  };
  return `<div class="hl"><div class="hl-sum"><span class="hl-big">讲义 已读 <span class="hl-done">${done}</span> / ${list.length}</span>`
    + `<span class="hl-bar"><span style="width:${pct(done, list.length)}"></span></span>`
    + `<span class="muted">读完就勾上，和时间表 13:45 那一格的讲义是同一个勾；D 标签是哪天读，标题是网页</span></div>`
    + `<div class="hl-grid">${[...new Set(list.map(p => p.section))].map(col).join('')}</div></div>`;
}
// browser side of the tracker: the live ticks from the local server, or the build state plus this browser's ticks
function articleClient() {
  var items = [].slice.call(document.querySelectorAll('.hl-p'));
  if (!items.length) return;
  var P = 'study-plan:', online = false, last = {};
  function ls(k, v) { try { if (arguments.length > 1) { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); return null; } return localStorage.getItem(k); } catch (e) { return null; } }
  function width(el, d, n) { if (el) el.style.width = (n ? 100 * d / n : 0).toFixed(1) + '%'; }
  function paint(has, built) {
    items.forEach(function (li) {
      var d = has(li.dataset.key) || (built && li.dataset.built === '1');
      li.classList.toggle('done', d);
      li.querySelector('input').checked = d;
    });
    [].slice.call(document.querySelectorAll('.hl')).forEach(function (box) {
      var all = box.querySelectorAll('.hl-p').length, done = box.querySelectorAll('.hl-p.done').length;
      box.querySelector('.hl-done').textContent = done;
      width(box.querySelector('.hl-sum .hl-bar span'), done, all);
      [].slice.call(box.querySelectorAll('.hl-col')).forEach(function (c) {
        var n = c.querySelectorAll('.hl-p').length, d = c.querySelectorAll('.hl-p.done').length;
        c.querySelector('.hl-c').textContent = d;
        width(c.querySelector('.hl-bar span'), d, n);
      });
    });
  }
  function live() { paint(function (k) { return !!last[k]; }, false); }
  function offline() { online = false; paint(function (k) { return ls(P + k) === '1'; }, true); }
  function load() {
    if (location.protocol === 'file:') return offline();
    fetch('/api/progress', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (st) { online = true; last = st.ticks || {}; live(); }).catch(offline);
  }
  items.forEach(function (li) {
    li.querySelector('input').addEventListener('change', function (e) {
      var key = li.dataset.key, on = e.target.checked;
      ls(P + key, on ? '1' : '');
      if (!online) return offline();
      fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Study': '1' }, body: JSON.stringify({ key: key, done: on, label: li.dataset.label }) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) { last = (j.state && j.state.ticks) || {}; ls(P + key, ''); live(); })
        .catch(function () { if (on) last[key] = li.dataset.label; else delete last[key]; live(); });
    });
  });
  load();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
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
.hl{margin:0 0 16px}
.hl-sum{display:flex;flex-wrap:wrap;align-items:center;gap:4px 18px;background:#fff;border:1px solid #dce4ea;border-radius:10px;padding:8px 14px;margin:0 0 10px}
.hl-big{font-size:18px;font-weight:600}
.hl-sum .muted{font-size:13px}
.hl-bar{height:6px;background:#e6ecf0;border-radius:3px;overflow:hidden}
.hl-sum>.hl-bar{flex:1 1 160px;max-width:360px}
.hl-bar span{display:block;height:100%;background:#2da44e}
.hl-grid{column-width:330px;column-gap:10px}
section.hl-col{display:inline-block;width:100%;box-sizing:border-box;break-inside:avoid;margin:0 0 10px;padding:8px 8px 6px}
.hl-col h2{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 3px;font-size:14.5px;line-height:1.3}
.hl-n{flex:none;font-size:12.5px;font-weight:400;color:#4b5b66}
.hl-col .hl-bar{height:4px;margin:5px 3px 4px}
.hl-col ul{list-style:none;margin:0;padding:0}
li.hl-p{display:flex;gap:5px;align-items:baseline;margin:1px 0;padding:1px 5px;border-radius:5px;font-size:13px;line-height:1.35}
li.hl-p.done{background:#dafbe1}
.hl-ck input{width:1em;height:1em;margin:0;vertical-align:-.14em;accent-color:#2da44e;cursor:pointer}
.hl-t{flex:1;min-width:0}
.hl-t a{text-decoration:none}
li.hl-p.done .hl-t a{color:#116329}
.hl-meta{flex:none;font-size:11.5px;color:#5b6b78;white-space:nowrap}
a.hl-day{display:inline-block;margin-left:5px;padding:0 3px;border:1px solid #c9d6de;border-radius:4px;line-height:1.3;color:#4b5b66;text-decoration:none}
li.hl-p.done a.hl-day{background:#2da44e;border-color:#2da44e;color:#fff}
</style>`;

module.exports = { DATA, DIFFS, PLAN, TRACKS, KEY, tracks, item, note, style, articles, articleBox, articleClient };
