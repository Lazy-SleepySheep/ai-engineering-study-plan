// 刷题记录: five tabs, LeetCode (the Top Interview 150, one column per LeetCode topic; solved problems are green with a
// check), Pattern (the 41 LeetCode patterns of the Data Structure & Algo block, patterns.cjs; ticked there or in the timetable),
// Hello Interview (the 13:45 block, hello-interview.cjs, one column per week; a day is done when its ☐ is ticked), and
// System Design and AI Coding (every Hello Interview practice problem, hi-problems.cjs, one column per difficulty;
// ticked right in the tab, the date of the tick is kept).
// A problem counts as solved when any of its ticks in the timetable is checked (its day, a review day or a repeat day).
// build.cjs writes AI_ENGINEER_TOP150_RECORD.html with the state at build time; the page then reads the live ticks from
// /api/progress (local server), or falls back to that state plus the ticks saved in this browser.
const fs = require('fs'), path = require('path');
const progress = require('./progress.cjs');
const patterns = require('./patterns.cjs');
const hi = require('./hello-interview.cjs');
const hp = require('./hi-problems.cjs');

const FILE = 'AI_ENGINEER_TOP150_RECORD.html', TITLE = '刷题记录';
// LeetCode's own topic order for the study plan; a topic not listed here goes at the end
const ORDER = ['Array / String', 'Two Pointers', 'Sliding Window', 'Matrix', 'Hashmap', 'Intervals', 'Stack', 'Linked List',
  'Binary Tree General', 'Binary Tree BFS', 'Binary Search Tree', 'Graph General', 'Graph BFS', 'Trie', 'Backtracking',
  'Divide & Conquer', "Kadane's Algorithm", 'Binary Search', 'Heap', 'Bit Manipulation', 'Math', '1D DP', 'Multidimensional DP'];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const pad = n => String(n).padStart(2, '0');

// [day, block] for each day of the timetable Markdown (root-relative, with ☐/☑)
const dayBlocks = md => [...md.matchAll(/<a id="day-(\d+)"><\/a>([\s\S]*?)(?=<a id="day-|$)/g)].map(([, d, b]) => [Number(d), b]);
// the <br> parts of a row's content cell: the same parts the timetable renderer turns into checkboxes, so the keys match
function rowParts(block, time) {
  const row = block.split('\n').find(l => l.startsWith('| ' + time));
  return row ? (row.slice(1, -1).split('|')[2] || '').trim().split('<br>') : [];
}
const tick = (p, day, part) => { p.keys.push(progress.keyOf('day-' + pad(day), part)); if (part.includes('☑')) p.done = true; };

// the 150 LeetCode problems with their days and tick keys (08:30 row)
function problems(md) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'top150-schedule.json'), 'utf8'));
  const list = Object.values(data.P).filter(p => p.top150).map(p => ({ ...p, days: [], reviews: [], keys: [], done: false }));
  const byN = new Map(list.map(p => [p.n, p])), bySlug = new Map(list.map(p => [p.slug, p]));
  for (const s of data.schedule) {
    for (const n of [...(s.own || []), ...(s.top || [])]) if (byN.has(n)) byN.get(n).days.push(s.day);
    for (const n of s.review || []) if (byN.has(n)) byN.get(n).reviews.push(s.day);
  }
  for (const [day, block] of dayBlocks(md)) for (const part of rowParts(block, '08:30')) {
    const m = part.match(/https:\/\/leetcode\.com\/problems\/([^/)]+)\//);
    const p = m && /[☐☑]/.test(part) && bySlug.get(m[1]);
    if (p) tick(p, day, part);
  }
  const lost = list.filter(p => !p.keys.length);
  if (lost.length) throw new Error('Top 150 problems without a tick in the timetable: ' + lost.map(p => p.n).join(', '));
  const first = p => Math.min(...(p.days.length ? p.days : p.reviews));
  return list.sort((a, b) => first(a) - first(b) || a.n - b.n);
}

const style = `<style>
.rec-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin:0 0 6px}
.rec-head h1{margin:0}
.rec-tabs{display:inline-flex;border:1px solid #c9d6de;border-radius:8px;overflow:hidden;background:#fff}
.rec-tabs button{border:0;background:none;padding:6px 14px;font:inherit;font-size:14px;color:#33454f;cursor:pointer;scroll-margin-top:calc(var(--bar-h,0px) + 8px)}
.rec-tabs button+button{border-left:1px solid #c9d6de}
.rec-tabs button[aria-selected="true"]{background:var(--accent);color:#fff}
.rec-tabs .rec-tab-n{margin-left:6px;font-size:12px;opacity:.85}
@media(max-width:600px){.rec-tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));width:100%}.rec-tabs button{white-space:nowrap;padding:6px 8px;font-size:13.5px;box-shadow:0 0 0 .5px #c9d6de}.rec-tabs button+button{border-left:0}}
.rec-note{margin:0 0 10px;font-size:13px}
.rec-sum{display:flex;flex-wrap:wrap;align-items:center;gap:4px 18px;background:#fff;border:1px solid #dce4ea;border-radius:10px;padding:8px 14px;margin:0 0 12px}
.rec-big{font-size:18px;font-weight:600}
.rec-big .muted{font-size:14px;font-weight:400}
.rec-sum>.rec-bar{flex:1 1 160px}
.rec-line{font-size:13px;color:#4b5b66}
.rec-msg{flex-basis:100%;margin:0;font-size:12px}
.rec-bar{height:6px;background:#e6ecf0;border-radius:3px;overflow:hidden}
.rec-bar span{display:block;height:100%;background:#2da44e}
.rec-grid{column-width:230px;column-gap:10px}
section.rec-col{display:inline-block;width:100%;box-sizing:border-box;break-inside:avoid;margin:0 0 10px;padding:8px 8px 6px}
.rec-col h2{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 3px;font-size:14.5px;line-height:1.3}
.rec-n{flex:none;font-size:12.5px;font-weight:400;color:#4b5b66}
.rec-col .rec-bar{height:4px;margin:5px 3px 4px}
.rec-col ul{list-style:none;margin:0;padding:0}
li.rec-p{display:flex;gap:5px;align-items:baseline;margin:1px 0;padding:1px 5px;border-radius:5px;font-size:13px;line-height:1.35}
.rec-p a{text-decoration:none}
.rec-p a:hover{text-decoration:underline}
.rec-ck{flex:none;width:.9em;color:#1a7f37;font-weight:700}
.rec-title{flex:1;min-width:0}
.rec-meta{flex:none;font-size:11.5px;color:#5b6b78;white-space:nowrap}
li.rec-p.done{background:#dafbe1}
li.rec-p.done .rec-title a{color:#116329}
</style>`;

// browser side: tabs, and recounting from the live ticks (server) or from the build state plus this browser's saved ticks
function client() {
  var items = [].slice.call(document.querySelectorAll('.rec-p')), P = 'study-plan:', TAB = 'study-record-tab';
  var panels = [].slice.call(document.querySelectorAll('.rec-panel')), tabs = [].slice.call(document.querySelectorAll('.rec-tabs button'));
  var chips = [].slice.call(document.querySelectorAll('.rec-day[data-keys]')), boxes = [].slice.call(document.querySelectorAll('.rec-box'));
  var built = items.map(function (li) { return li.classList.contains('done'); });
  var web = location.protocol !== 'file:' && ['127.0.0.1', 'localhost'].indexOf(location.hostname) < 0;   // GitHub Pages
  var online = false, last = {}, NOTE_ON = '已连接本地服务器：显示最新的勾选，切回这个页面时会自动刷新';
  function ls(k, v) { try { if (arguments.length > 1) { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); return null; } return localStorage.getItem(k); } catch (e) { return null; } }
  function md(d) { var m = /(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? +m[2] + '/' + +m[3] : ''; }
  function today() { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); }
  function keys(li) { return li.dataset.keys.split(' '); }
  function bar(el, done, total) { el.style.width = (total ? 100 * done / total : 0).toFixed(1) + '%'; }
  function set(root, sel, v) { [].slice.call(root.querySelectorAll(sel)).forEach(function (el) { el.textContent = v; }); }
  // has(k): is tick k checked; label(k): its label (the live ticks); useBuilt: also count what was ticked when the page was built
  function show(has, label, useBuilt, note) {
    items.forEach(function (li, i) {
      var ks = keys(li), d = ks.some(has) || (useBuilt && built[i]), box = li.querySelector('.rec-box');
      li.classList.toggle('done', d);
      if (!box) { li.querySelector('.rec-ck').textContent = d ? '✓' : ''; return; }
      box.checked = d;
      li.querySelector('.rec-when').textContent = d ? md(label(ks[0]) || (built[i] ? li.dataset.when : '')) : '';
    });
    chips.forEach(function (c) { c.classList.toggle('ok', c.dataset.keys.split(' ').some(has) || (useBuilt && c.dataset.built === '1')); });
    panels.filter(function (panel) { return panel.querySelector('.rec-p'); }).forEach(function (panel) {
      var all = panel.querySelectorAll('.rec-p'), done = [].slice.call(panel.querySelectorAll('.rec-p.done'));
      set(panel, '.rec-done', done.length);
      set(panel, '.rec-left', all.length - done.length);
      bar(panel.querySelector('.rec-sum .rec-bar span'), done.length, all.length);
      [].slice.call(panel.querySelectorAll('.rec-col')).forEach(function (col) {
        var n = col.querySelectorAll('.rec-p').length, d = col.querySelectorAll('.rec-p.done').length;
        col.querySelector('.rec-c').textContent = d;
        bar(col.querySelector('.rec-bar span'), d, n);
      });
      [].slice.call(panel.querySelectorAll('[data-count]')).forEach(function (el) {
        el.textContent = done.filter(function (li) { return li.dataset[el.dataset.count] === el.dataset.v; }).length;
      });
      set(document, '.rec-tab-n[data-tab="' + panel.dataset.tab + '"]', done.length + ' / ' + all.length);
      set(panel, '.rec-msg', note);
    });
  }
  function offline() {
    online = false;
    show(function (k) { return ls(P + k) === '1'; }, function () { return ''; }, true,
      web ? '网页版：显示的是上次推送到 GitHub 时的进度，加上这台设备里的勾选' : '没有连接本地服务器：显示的是上次生成页面时的进度，加上这个浏览器里的勾选');
  }
  function load() {
    if (location.protocol === 'file:') return offline();
    fetch('/api/progress', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (st) {
      online = true;
      last = st.ticks || {};
      show(function (k) { return !!last[k]; }, function (k) { return last[k]; }, false, NOTE_ON);
    }).catch(offline);
  }
  function pick(name, save) {
    if (!panels.some(function (p) { return p.dataset.tab === name; })) name = panels[0].dataset.tab;
    panels.forEach(function (p) { p.hidden = p.dataset.tab !== name; });
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === name)); });
    if (save) {
      try { localStorage.setItem(TAB, name); } catch (e) {}
      history.replaceState(null, '', '#' + name);
    }
  }
  // System Design / AI Coding: tick a problem on the day it was practised; the label keeps the date
  boxes.forEach(function (box) {
    box.addEventListener('change', function () {
      var li = box.closest('.rec-p'), key = keys(li)[0], on = box.checked, label = li.dataset.label + ' · ' + today();
      ls(P + key, on ? '1' : '');
      if (!online) return offline();
      fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Study': '1' }, body: JSON.stringify({ key: key, done: on, label: label }) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) { last = (j.state && j.state.ticks) || {}; ls(P + key, ''); show(function (k) { return !!last[k]; }, function (k) { return last[k]; }, false, NOTE_ON); })
        .catch(function () {
          if (on) last[key] = label; else delete last[key];
          show(function (k) { return !!last[k]; }, function (k) { return last[k]; }, false, '保存到服务器失败，已先存在这个浏览器里（服务器是这次更新之前启动的话，关掉再运行一次 start-server.bat）');
        });
    });
  });
  tabs.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.tab, true); }); });
  window.addEventListener('hashchange', function () { pick(location.hash.slice(1), false); });
  pick(location.hash.slice(1) || ls(TAB) || '', false);
  load();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
}

function page(md, { shell, esc }) {
  const pct = (d, n) => (n ? 100 * d / n : 0).toFixed(1) + '%';
  const dayLink = (day, tip) => `<a href="AI_ENGINEER_TRANSITION_PLAN.html#day-${pad(day)}" target="_blank" rel="noopener"${tip ? ` title="${esc(tip)}"` : ''}>Day ${pad(day)}</a>`;
  // one tab: summary (done / left, bar, count lines) and one column per section
  const panel = (tab, list, sections, lines, item, [doneWord, unit] = ['已刷', '题'], note = '') => {
    const done = list.filter(p => p.done).length;
    const line = ([key, label, values]) => `<span class="rec-line">${label ? label + ' ' : ''}${values.map(v => {
      const all = list.filter(p => p[key] === v);
      return `${esc(v)} <span data-count="${key}" data-v="${esc(v)}">${all.filter(p => p.done).length}</span> / ${all.length}`;
    }).join(' · ')}</span>`;
    const col = s => {
      const ps = list.filter(p => p.section === s), d = ps.filter(p => p.done).length;
      return `<section class="rec-col"><h2><span>${esc(s)}</span><span class="rec-n"><span class="rec-c">${d}</span> / ${ps.length}</span></h2>`
        + `<div class="rec-bar"><span style="width:${pct(d, ps.length)}"></span></div><ul>${ps.map(item).join('')}</ul></section>`;
    };
    return `<div class="rec-panel" data-tab="${tab}"${tab === 'leetcode' ? '' : ' hidden'}>`
      + `<div class="rec-sum"><span class="rec-big">${doneWord} <span class="rec-done">${done}</span> / ${list.length}<span class="muted"> · 还剩 <span class="rec-left">${list.length - done}</span> ${unit}</span></span>`
      + `<span class="rec-bar"><span style="width:${pct(done, list.length)}"></span></span>${lines.map(line).join('')}<p class="rec-msg muted"></p></div>${note}`
      + `<div class="rec-grid">${sections.map(col).join('')}</div></div>`;
  };
  const li = (p, link, day, tip) => `<li class="rec-p${p.done ? ' done' : ''}" data-keys="${esc(p.keys.join(' '))}" data-diff="${esc(p.diff)}">`
    + `<span class="rec-ck" aria-hidden="true">${p.done ? '✓' : ''}</span><span class="rec-title">${link}</span>`
    + `<span class="rec-meta">${esc(p.diff[0])} · ${dayLink(day, tip)}</span></li>`;

  const lc = problems(md);
  const lcSections = [...new Set(lc.map(p => p.section))].sort((a, b) => {
    const i = x => (ORDER.includes(x) ? ORDER.indexOf(x) : ORDER.length);
    return i(a) - i(b) || a.localeCompare(b);
  });
  const lcItem = p => {
    const day = Math.min(...(p.days.length ? p.days : p.reviews)), rev = p.reviews.filter(r => r !== day);
    return li(p, `<a href="https://leetcode.com/problems/${esc(p.slug)}/" target="_blank" rel="noopener">${p.n}. ${esc(p.title)}</a>`,
      day, rev.length ? '复习：' + rev.map(r => 'Day ' + pad(r)).join('、') : '');
  };

  const pt = patterns.tab(md, { esc });

  // Hello Interview: one column per week; meta = kind and day
  const KIND = { 'System Design': 'SD', 'AI Coding': 'AI Coding', '基础': '基础', '复盘': '复盘' };
  const hiList = hi.items(md);
  const hiItem = p => `<li class="rec-p${p.done ? ' done' : ''}" data-keys="${esc(p.keys.join(' '))}" data-group="${esc(p.group)}">`
    + `<span class="rec-ck" aria-hidden="true">${p.done ? '✓' : ''}</span><span class="rec-title"><a href="${esc(hi.mainLink(p))}" target="_blank" rel="noopener" title="${esc(p.task)}">${esc(p.title)}</a></span>`
    + `<span class="rec-meta">${esc(KIND[p.kind])} · ${dayLink(p.day)}</span></li>`;

  const hpTracks = hp.tracks(md);

  const count = list => `${list.filter(p => p.done).length} / ${list.length}`;
  const body = `${style}${patterns.style}${hp.style}<div class="rec-head"><h1>${TITLE}</h1><div class="rec-tabs" role="tablist">`
    + `<button type="button" role="tab" id="leetcode" data-tab="leetcode" aria-selected="true">LeetCode<span class="rec-tab-n" data-tab="leetcode">${count(lc)}</span></button>`
    + `<button type="button" role="tab" id="pattern" data-tab="pattern" aria-selected="false">Pattern<span class="rec-tab-n" data-tab="pattern">${pt.done} / ${pt.total}</span></button>`
    + `<button type="button" role="tab" id="hellointerview" data-tab="hellointerview" aria-selected="false">Hello Interview<span class="rec-tab-n" data-tab="hellointerview">${count(hiList)}</span></button>`
    + hpTracks.map(t => `<button type="button" role="tab" id="${t.tab}" data-tab="${t.tab}" aria-selected="false">${t.name}<span class="rec-tab-n" data-tab="${t.tab}">${count(t.items)}</span></button>`).join('')
    + `</div></div>`
    + `<p class="rec-note muted">LeetCode 的勾选在<a href="AI_ENGINEER_TRANSITION_PLAN.html">每日时间表</a>里做，当天、复习日或重复的那天勾过一次就算做了；按 LeetCode 的专题分列，每列按日期排序，鼠标停在 Day 上能看到其他日期。Pattern 可以直接在表里打勾，和时间表当天 Data Structure & Algo 那一格的 pattern 是同一个勾。Hello Interview 在时间表 13:45 那一格打勾，每周一列，鼠标停在题目上能看到当天要做什么。System Design 和 AI Coding 是 Hello Interview 题库里的全部练习题，练过哪道就在表里直接打勾。</p>`
    + panel('leetcode', lc, lcSections, [['diff', '', DIFFS]], lcItem)
    + pt.panel
    + panel('hellointerview', hiList, [...new Set(hiList.map(p => p.section))], [['group', '', hi.GROUPS]], hiItem, ['已完成', '天'])
    + hpTracks.map(t => panel(t.tab, t.items.map(p => ({ ...p, section: p.diff })), hp.DIFFS.filter(d => t.items.some(p => p.diff === d)),
      [['diff', '', hp.DIFFS], ['planned', '', hp.PLAN]], p => hp.item(p, esc), ['已练', '题'], hp.note(t))).join('')
    + `<script>(${client.toString()})();(${patterns.client.toString()})();</script>`;
  fs.writeFileSync(FILE, shell(TITLE, body, true));
  return { file: FILE, leetcode: lc.length, patterns: pt.total, helloInterview: hiList.length, systemDesign: hpTracks[0].items.length, aiCoding: hpTracks[1].items.length };
}

module.exports = { FILE, TITLE, problems, page };
