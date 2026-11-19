// Hello Interview in 刷题记录: the System Design and AI Coding tabs (the plan's days of the 13:45 block, which used to be
// a Hello Interview tab of their own, are split between them). The problem lists (32 System Design, 13 AI Coding) are in
// hello-interview-problems.json, read from hellointerview.com. Each tab has, from the top:
//   - the 讲义 tracker: the track's learning pages, ticked on their line in the timetable (articles, articleBox)
//   - the problems by week, in the order of the plan (hello-interview.json): each problem on the day it is practised (two on
//     a day with two), and the track's days without a problem of their own (Day 04 答题框架, Day 35 流程查漏, Day 42 重做
//     最弱的 Coding). A row's tick is its day's 13:45 ☐ in the timetable, so ticking here or there is the same; the two
//     problems of one day share it. Ticked here, the label ends with the date ("… · 2026-11-17"), shown next to the row.
//   The problems' own ticks of before ("hi-sd.<slug>", "hi-ai.<slug>", KEY) are no longer written; none had been ticked.
const fs = require('fs'), path = require('path');
const progress = require('./progress.cjs');
const hi = require('./hello-interview.cjs');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'hello-interview-problems.json'), 'utf8'));
const HI = 'https://www.hellointerview.com';
const DIFFS = ['Easy', 'Medium', 'Hard'];
const TRACKS = [
  { tab: 'systemdesign', name: 'System Design', id: 'sd', kind: 'System Design', list: DATA.systemDesign,
    learn: '/learn/system-design/problem-breakdowns/', practice: p => HI + (p.guided ? '/practice/system-design/new/' + p.slug : '/practice/system-design') },
  { tab: 'aicoding', name: 'AI Coding', id: 'ai', kind: 'AI Coding', list: DATA.aiCoding,
    learn: '/learn/ai-coding/problem-breakdowns/', practice: () => HI + '/practice/ai-coding?format=structured' },
];
const KEY = /^hi-(?:sd|ai)\.[a-z0-9-]+$/;   // server.cjs accepts these besides the timetable's day keys
const pad = n => String(n).padStart(2, '0');
// the Video column of a row: the link and the video's length, or empty when the page has no video
const videoSlot = (u, esc) => `<span class="hl-slot hl-sv">${hi.videoOf(u) ? `<a href="${esc(hi.videoOf(u))}" target="_blank" rel="noopener" title="电脑上（本地服务器）播本地视频；手机上打开 YouTube 或 Google Drive">Video</a>`
  + `<span class="hl-len">${hi.videoLen(u)}</span>` : ''}</span>`;
const isPractice = u => u.includes('/practice/');

for (const t of TRACKS) for (const p of t.list) {
  if (!KEY.test(`hi-${t.id}.${p.slug}`) || !DIFFS.includes(p.diff)) throw Error('hello-interview-problems: bad problem ' + p.slug);
}
// every problem breakdown linked from the plan must be in the lists (catches a typo in a slug)
for (const it of hi.DATA.items) for (const [, u] of it.links) {
  const t = TRACKS.find(t => u.startsWith(HI + t.learn));
  if (t && !t.list.some(p => u === HI + t.learn + p.slug)) throw Error('hello-interview: day ' + it.day + ' links an unknown problem ' + u);
}

// md: the timetable Markdown (with ☐/☑), for the 13:45 tick of each plan day. A track's rows, by week; the track gets
// its own kind of day and the 基础 / 复盘 days whose title names it (Day 04 "System Design 答题框架", Day 35 "AI Coding …")
function tracks(md) {
  const days = hi.items(md), mine = t => days.filter(it => it.kind === t.kind || (!TRACKS.some(x => x.kind === it.kind) && it.title.includes(t.name)));
  for (const it of days) if (TRACKS.filter(t => mine(t).includes(it)).length !== 1) throw Error('hi-problems: day ' + it.day + ' belongs to no track or to two');
  return TRACKS.map(t => {
    const rows = [];
    for (const it of mine(t)) {
      const ps = it.links.filter(([, u]) => u.startsWith(HI + t.learn)).map(([, u]) => t.list.find(p => HI + t.learn + p.slug === u));
      const day = { day: it.day, keys: it.keys, done: it.done, label: it.label, section: it.section, task: it.task, what: `${it.kind}：${it.title}` };
      const practice = (it.links.find(([, u]) => isPractice(u)) || [])[1] || '';
      // a day without a problem of its own: 基础 (Day 04, 35), or a pick from the list (Day 42, a 练习题 link only): 自选
      if (!ps.length) rows.push({ ...day, kind: 'day', tag: TRACKS.some(x => x.kind === it.kind) ? '自选' : it.kind, title: it.title, diff: '', url: hi.mainLink(it), practiceUrl: practice, with: [] });
      for (const p of ps) {
        const url = HI + t.learn + p.slug;
        rows.push({ ...day, ...p, kind: 'problem', url, practiceUrl: t.practice(p), with: ps.filter(q => q !== p).map(q => q.title) });
      }
    }
    for (const p of t.list) if (rows.filter(r => r.slug === p.slug).length !== 1) throw Error('hi-problems: ' + p.title + ' is not on exactly one day of the plan');
    return { ...t, items: rows, sections: [...new Set(rows.map(r => r.section))] };
  });
}

// one row of a tab (an <li> of top150-record's columns): checkbox (the day's tick in the timetable), title (the problem's
// 题解, or the day's main link), the date ticked here, then in columns: difficulty, the day, its video, 练习
function item(r, esc) {
  const pair = r.with.length ? `<span class="rec-pair" title="${esc(`和 ${r.with.join('、')} 同一天，共用时间表这天的一个勾`)}">⇄</span>` : '';
  const slot = (cls, u, text, tip) => `<span class="hl-slot ${cls}">${u ? `<a href="${esc(u)}" target="_blank" rel="noopener"${tip ? ` title="${tip}"` : ''}>${text}</a>` : ''}</span>`;
  return `<li class="rec-p rec-tk${r.done ? ' done' : ''}" data-keys="${esc(r.keys.join(' '))}" data-diff="${esc(r.diff)}" data-label="${esc(r.label)}" data-when="">`
    + `<label class="rec-ck"><input type="checkbox" class="rec-box" aria-label="完成 ${esc(r.title)}"${r.done ? ' checked' : ''}></label>`
    + `<span class="rec-title"><a href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.kind === 'day' ? r.task : '题解')}">${esc(r.title)}</a>${pair}</span>`
    + `<span class="rec-meta"><span class="rec-when"></span><span class="rec-dif" title="${esc(r.diff || (r.tag === '自选' ? '从题库里自己选题' : '这天没有题库里的题'))}">${r.diff ? r.diff[0] : r.tag}</span>`
    + `<a class="rec-day${r.done ? ' ok' : ''}" href="AI_ENGINEER_TRANSITION_PLAN.html#day-${pad(r.day)}" target="_blank" rel="noopener" data-keys="${esc(r.keys.join(' '))}"${r.done ? ' data-built="1"' : ''} title="${esc(`Day ${pad(r.day)} · ${r.what}`)}">D${pad(r.day)}</a>`
    + (r.kind === 'problem' ? videoSlot(r.url, esc) : slot('hl-sv', '')) + slot('hl-sp', r.practiceUrl, '练习', 'Hello Interview 的练习页') + `</span></li>`;
}

// The learning pages (讲义) of a track, for the tracker at the top of its tab: System Design's Core Concepts, Patterns and
// Key Technologies, AI Coding's Common Patterns (DATA.learn). Each has the tick of its line in the timetable's 13:45 row,
// so ticking it here or there is the same tick, the day it is read, and its 网页 / 本地连接 / Summary / Video links.
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
    // 本地连接, Summary and Video (with its length) each in a column of its own, empty when the page has none, so the columns line up
    const links = [['l', hi.localOf(p.url), '本地连接'], ['s', hi.summaryOf(p.id), 'Summary']]
      .map(([k, u, t]) => `<span class="hl-slot hl-s${k}">${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>` : ''}</span>`).join('') + videoSlot(p.url, esc);
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
    + `<span class="hl-bar"><span style="width:${pct(done, list.length)}"></span></span><span class="hl-pct">${pct(done, list.length)}</span>`
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
      box.querySelector('.hl-pct').textContent = (all ? 100 * done / all : 0).toFixed(1) + '%';
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
  const problems = t.items.filter(r => r.kind === 'problem').length, other = t.items.filter(r => r.kind === 'day');
  const shared = [...new Set(t.items.filter(r => r.with.length).map(r => r.day))];
  const days = ds => ds.map(d => 'Day ' + pad(d)).join('、');
  return `<p class="rec-note muted">按周排，顺序和时间表 13:45 那一格一样：题库里的 ${problems} 道题每道排在一天`
    + (other.length ? `，另外 ${other.map(r => `Day ${pad(r.day)}（${r.title}）`).join('、')} 不对应题库里的某一道题` : '') + `。`
    + `勾选就是时间表那天 13:45 的勾，在哪边勾都行，从这里勾会记下日期`
    + (shared.length ? `；${days(shared)} 一天两道题，两道共用一个勾（⇄）` : '') + `。`
    + `E/M/H 是难度，D 标签跳到时间表那一天，题目链接是题解，Video 是本地视频，“练习”是 Hello Interview 的练习页。</p>`;
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
.hl-sum>.hl-bar{flex:1 1 160px;max-width:360px;height:10px;border-radius:5px}
.hl-pct{flex:none;min-width:3.6em;font-size:15px;font-weight:600;color:#116329}
.hl-bar span{display:block;height:100%;background:#2da44e}
.hl-grid{column-width:400px;column-gap:10px}
.rec-panel[data-tab="systemdesign"] .rec-grid,.rec-panel[data-tab="aicoding"] .rec-grid{column-width:356px}
/* a row of a problem (title, difficulty, day, Video with its length, 练习) on one line: columns of 356px or more; the page a bit wider on large screens so three of them fit */
@media(min-width:1200px){main:has(.rec-panel){max-width:1160px}}
/* a tab whose problems have no video (AI Coding): no empty Video column */
.rec-grid:not(:has(.hl-len)) .hl-sv{display:none}
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
.hl-slot{display:inline-block;text-align:left;vertical-align:baseline}
.hl-sl{width:4.4em}.hl-ss{width:4.4em}.hl-sv{width:6.6em}
.hl-len{display:inline-block;width:3.6em;text-align:right;font-variant-numeric:tabular-nums;color:#7f8f9a}
.rec-meta .hl-sv{margin-left:6px}
.hl-sp{width:2.2em;text-align:right}
.rec-dif{display:inline-block;width:2.2em;text-align:center;color:#4b5b66}
.rec-pair{margin-left:4px;font-size:11.5px;color:#7f8f9a;cursor:help}
a.hl-day{display:inline-block;margin-left:5px;padding:0 3px;border:1px solid #c9d6de;border-radius:4px;line-height:1.3;color:#4b5b66;text-decoration:none}
li.hl-p.done a.hl-day{background:#2da44e;border-color:#2da44e;color:#fff}
</style>`;

module.exports = { DATA, DIFFS, TRACKS, KEY, tracks, item, note, style, articles, articleBox, articleClient };
