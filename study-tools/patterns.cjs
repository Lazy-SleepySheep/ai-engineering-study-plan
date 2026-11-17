// LeetCode Pattern: the pattern part of the timetable's Data Structure & Algo block (08:30–11:15) and the Pattern tab of 刷题记录.
// The 41 patterns come from design-gurus/grokking-coding-interview (CC BY 4.0); patterns.json holds their text, a short
// Chinese summary, the repo's problems as LeetCode problems, and which pattern each problem of the morning plan uses.
//   - Day 01–03: skipped (the block used to be ML + QuantVault at 13:30); Day 04 Hash Maps, Day 05 Two Pointers
//   - Day 06–41: one pattern a day in the order of the morning: the day's Study topic decides its pattern (Day 08 Sliding
//     Window, Day 10 Stacks, Day 13 linked lists, ...), and top150-schedule.json puts each Top 150 problem on the day of
//     its pattern or after it, never before. Two a day: Top K + K-way Merge (Day 11) and the niche ones at the end;
//     patterns without Top 150 problems (Cyclic Sort, Ordered Set, ...) sit where the morning catches up on earlier ones
//   - Day 42–45: mixed recognition, problems listed without their pattern
// A pattern counts as learned when the ☐ on its line in the timetable is ticked; the Pattern tab ticks the same key.
const fs = require('fs'), path = require('path');
const progress = require('./progress.cjs');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'patterns.json'), 'utf8'));
const TOP = JSON.parse(fs.readFileSync(path.join(__dirname, 'top150-schedule.json'), 'utf8'));
const byN = new Map(DATA.patterns.map(p => [p.n, p]));
const pad = n => String(n).padStart(2, '0');
const page = p => `${DATA.repo}/blob/main/patterns/${p.file}.md`;
const lcUrl = slug => `https://leetcode.com/problems/${slug}/`;

// learning order: one entry per day from Day 04 (Day 04, 05 ... 41)
const ORDER = [[9], [1], [4], [29], [3], [31], [7], [18, 19], [11], [6],
  [2], [13], [10], [38], [16], [12], [26], [17], [25], [30],
  [15], [24], [33], [20], [22], [21], [23], [36], [5], [28],
  [27], [8], [32], [37], [14], [39], [40, 41], [34, 35]];
const FIRST = 4, MIXED = [42, 43, 44, 45], PER_MIXED = 4;
const SCHEDULE = Object.fromEntries(ORDER.map((ns, i) => [FIRST + i, ns]));
const STAGE_TEXT = {
  1: '第一阶段 · 常见 15 种（DP 算 3 个，共 17 个）',
  2: '第二阶段 · 其余 Core',
  3: '第三阶段 · Advanced',
  4: '第四阶段 · 偏门',
};

// the morning plan: LeetCode problems per day (own + Top 150 + review)
const morning = new Map();
for (const s of TOP.schedule) for (const [list, review] of [[s.own, false], [s.top, false], [s.review, true]])
  for (const n of list || []) { if (!morning.has(n)) morning.set(n, []); morning.get(n).push({ day: s.day, review }); }

// checks: every pattern scheduled once, every morning problem mapped to a pattern (or explicitly to none)
{
  const seen = ORDER.flat().sort((a, b) => a - b);
  if (seen.join() !== DATA.patterns.map(p => p.n).sort((a, b) => a - b).join()) throw Error('patterns: ORDER must list each of the 41 patterns once');
  const lost = [...morning.keys()].filter(n => !(String(n) in DATA.plan));
  if (lost.length) throw Error('patterns: morning problems without a pattern in patterns.json "plan": ' + lost.join(', '));
  const extra = Object.keys(DATA.plan).filter(n => !morning.has(+n));
  if (extra.length) throw Error('patterns: "plan" lists problems that are not in the morning plan: ' + extra.join(', '));
  for (const [n, pn] of Object.entries(DATA.plan)) if (pn !== null && !byN.has(pn)) throw Error('patterns: problem ' + n + ' -> unknown pattern ' + pn);
}

// practice problems: free, not in the morning plan, never used twice; easiest first
const RANK = { Easy: 0, Medium: 1, Hard: 2 }, used = new Set();
const candidates = p => p.lc.filter(x => !x[4] && !morning.has(x[0]) && !used.has(x[0]));
function take(list, k) {
  const out = list.slice(0, k);
  out.forEach(x => used.add(x[0]));
  return out;
}
const practice = {};
for (const [day, ns] of Object.entries(SCHEDULE)) for (const n of ns) {
  const p = byN.get(n), list = candidates(p).sort((a, b) => RANK[a[3]] - RANK[b[3]]);
  practice[n] = take(list, ns.length > 1 ? 1 : 2);
  if (!practice[n].length) throw Error('patterns: no free practice problem left for #' + n);
}
// mixed recognition: one Medium (or Easy) per pattern of stages 1–2, in learning order, spread over the four days
const mixed = Object.fromEntries(MIXED.map(d => [d, []]));
{
  const picks = [];
  for (const n of ORDER.flat().filter(n => byN.get(n).stage <= 2)) {
    if (picks.length === MIXED.length * PER_MIXED) break;
    const list = candidates(byN.get(n)), x = list.find(x => x[3] === 'Medium') || list.find(x => x[3] === 'Easy');
    if (x) picks.push(...take([x], 1));
  }
  if (picks.length < MIXED.length * PER_MIXED) throw Error('patterns: not enough problems for mixed recognition');
  picks.forEach((x, i) => mixed[MIXED[i % MIXED.length]].push(x));
}

const lcLink = x => `[${x[0]}. ${x[2]}](${lcUrl(x[1])}) · ${x[3]} ☐`;
// the pattern's line, with the minutes of the reading and its problems: "[#29 Prefix Sum](page)（65mins）： ☐"; on a
// two-pattern day the first has no minutes ("[#18 ...](page) ☐"), the second has them for both
const patternLine = (p, mins) => `[#${p.n} ${p.name}](${page(p)})${mins ? `（${mins}mins）：` : ''} ☐`;

// the practice and mixed-recognition problems (slugs): not part of the morning plan, so validate.cjs leaves them out
// when it compares the morning's LeetCode links with the original plan
const EXTRA = new Set([...Object.values(practice), ...Object.values(mixed)].flat().map(x => x[1]));
// minutes of a morning problem; the plan's engineering problems (KV store, rate limiter, crawler, ...) take 30
const MIN = { Easy: 15, Medium: 20, Hard: 30 }, ENG = new Set([706, 981, 394, 165, 468, 1114, 1115, 622, 359, 1236, 2408]);

// Data Structure & Algo (08:30–11:15): the day's morning row (08:30, from reschedule.cjs) and its LeetCode pattern in
// one cell. First the pattern with the minutes for it and its problems, then its problems (the morning's problems of that
// pattern and the practice ones, easiest first), then SQL, the other problems and the reviews, each after its "… N mins："
// line. The HTML shows these labels in a left column and the problems next to them (build.cjs). The morning's first line (the old study topic and its
// 资料 links) is dropped. Every problem keeps its own line text, so its tick key does not change.
function block(day, line) {
  const parts = line.replace(/^\|[^|]*\|[^|]*\| /, '').replace(/ \|$/, '').split('<br>').slice(1);
  const ns = day < FIRST || mixed[day] ? [] : SCHEDULE[day];
  if (day >= FIRST && !mixed[day] && !ns) throw Error('patterns: nothing scheduled on day ' + day);
  const diffOf = p => (p.match(/· (Easy|Medium|Hard)(?: ☐| ☑)$/) || [])[1];
  const minOf = p => (ENG.has(+((p.match(/^\[(\d+)\. /) || [])[1])) ? 30 : MIN[diffOf(p)] || 0);
  const related = [], sql = [], other = [], review = [];
  for (const p of parts) {
    const n = +((p.match(/^\[(\d+)\. /) || [])[1]);
    if (p.includes('· SQL')) sql.push(p);
    else if (p.includes('· 复习 ')) review.push(p);
    else if (n && ns.includes(DATA.plan[n])) related.push(p);
    else other.push(p);
  }
  const out = [];
  if (mixed[day]) out.push('混合识别 40 mins（题目不标 pattern）：', ...mixed[day].map(lcLink));
  else if (ns.length) {
    const ps = ns.map(n => byN.get(n)), two = ps.length > 1;
    const rank = p => ({ Easy: 0, Medium: 1, Hard: 2 })[diffOf(p)] ?? 3;
    const list = [...ps.flatMap(p => practice[p.n]).map(lcLink), ...related].sort((a, b) => rank(a) - rank(b));
    // reading 15 minutes (10 each for two), the two practice problems 30 (25 for two), and the morning's problems of the pattern
    const mins = (two ? 20 + 25 : 15 + 30) + related.reduce((a, p) => a + minOf(p), 0);
    out.push(...ps.map((p, i) => patternLine(p, i === ps.length - 1 ? mins : 0)), ...list);
  }
  if (sql.length) out.push('SQL 60 mins：', ...sql);
  if (other.length) {
    const mins = other.reduce((a, p) => a + (minOf(p) || +((p.match(/约 (\d+) 分钟/) || [])[1] || 0)), 0);
    out.push(`${ns.length || mixed[day] ? '其他题' : '刷题'} ${mins} mins：`, ...other);
  }
  if (review.length) out.push(`复习 ${10 * review.length} mins：`, ...review);
  return `| 08:30–10:30 | Data Structure & Algo | ${out.join('<br>')} |`;
}
// 学习提示 line(s), ending with a newline, or '' (Day 01–03)
function tip(day) {
  if (day < FIRST) return '';
  if (mixed[day]) return `- Pattern 混合识别：先盖住答案读题，说出 pattern 和 cue，再对照 [Recognize the Pattern](${DATA.repo}/${DATA.links[0].path}) 的 Decision Tree 检查判断对不对；剩下的时间重学刷题记录 Pattern tab 里还没勾的 pattern\n`;
  const ns = SCHEDULE[day];
  return ns.map(n => `- Pattern 重点：${byN.get(n).name} - ${byN.get(n).zh}\n`).join('')
    + (ns.some(n => byN.get(n).stage === 4) ? '- 偏门的 pattern 说得清思路就够，练习题不一定写完\n' : '');
}
// the "今天学习 Topic" entry (Markdown), or '' (Day 01–03)
function topic(day) {
  if (day < FIRST) return '';
  if (mixed[day]) return `混合识别（${mixed[day].length} 题）`;
  return SCHEDULE[day].map(n => `[#${n} ${byN.get(n).name}](${page(byN.get(n))})`).join('、');
}
// the day's pattern(s) as plain text ("Merge Intervals", "混合识别"), or '' (Day 01–03)
const topicText = day => (day < FIRST ? '' : mixed[day] ? '混合识别（题目不标 pattern）' : SCHEDULE[day].map(n => byN.get(n).name).join(' + '));
const lessonDay = Object.fromEntries(Object.entries(SCHEDULE).flatMap(([d, ns]) => ns.map(n => [n, +d])));

// Pattern tab of 刷题记录: md is the timetable Markdown (with ☐/☑), used for the tick keys and the built state
function tab(md, { esc }) {
  // ticks: each pattern's ☐ (its "（N mins）：" line) in the Data Structure & Algo row. planned: every LeetCode problem of that row (the
  // morning's problems and the practice ones), by slug: its days and tick keys, and whether it is ticked - a problem chip
  // is green only when it is
  const ticks = new Map(), planned = new Map();
  for (const [, day, block] of md.matchAll(/<a id="(day-\d+)"><\/a>([\s\S]*?)(?=<a id="day-|$)/g)) {
    for (const line of block.split('\n').filter(l => /^\| 08:30/.test(l))) {
      for (const part of (line.slice(1, -1).split('|')[2] || '').trim().split('<br>')) {
        if (!/[☐☑]/.test(part)) continue;
        const m = part.match(/\/patterns\/([\w-]+)\.md\)/), q = part.match(/https:\/\/leetcode\.com\/problems\/([^/)]+)\//);
        if (m) ticks.set(m[1], { key: progress.keyOf(day, part), label: progress.strip(part), done: part.includes('☑') });
        else if (q) {
          if (!planned.has(q[1])) planned.set(q[1], []);
          planned.get(q[1]).push({ day: +day.slice(4), slot: EXTRA.has(q[1]) ? 'practice' : 'morning', key: progress.keyOf(day, part), done: part.includes('☑') });
        }
      }
    }
  }
  const order = ORDER.flat().map(n => byN.get(n));
  for (const p of order) if (!ticks.has(p.file)) throw Error('patterns: no tick for ' + p.name + ' in the timetable');
  const done = order.filter(p => ticks.get(p.file).done).length;
  // a problem: green with ✓ once any of its ticks in the timetable is checked; otherwise the first day it is planned (D05)
  const chip = x => {
    const pl = planned.get(x[1]) || [], done = pl.some(e => e.done), first = pl.length ? Math.min(...pl.map(e => e.day)) : 0;
    const when = [...new Set(pl.map(e => `Day ${pad(e.day)} ${e.slot === 'morning' ? '刷题' : '练习'}`))];
    const tip = `${x[0]}. ${x[2]} · ${x[3]}${x[4] ? ' · 会员题' : ''}${x[5] ? ' · 补充题（repo 里没有对应的 LeetCode 题）' : ''}${when.length ? ' · 计划在 ' + when.join('、') : ' · 没有排进计划'}`;
    return `<a class="pt-q${done ? ' pt-ok' : ''}" href="${lcUrl(x[1])}" target="_blank" rel="noopener" title="${esc(tip)}"`
      + `${pl.length ? ` data-keys="${esc(pl.map(e => e.key).join(' '))}"` : ''}${done ? ' data-built="1"' : ''}>`
      + `<span class="pt-qt">${x[0]} ${esc(x[2])}${x[4] ? ' 🔒' : ''}</span>${first ? `<span class="pt-qd">D${pad(first)}</span>` : ''}</a>`;
  };
  // a row: the name is followed by the day it is learned, e.g. "Hash Maps (D04)", linking to that day of the timetable.
  // 备注 is the same text as this pattern's box in 学习记录 (Study notes/drafts.json, keyed by the tick key)
  const rowHtml = p => {
    const t = ticks.get(p.file), d = lessonDay[p.n];
    return `<tr class="pt-row${t.done ? ' done' : ''}" data-key="${esc(t.key)}" data-label="${esc(t.label)}" data-stage="${p.stage}"${t.done ? ' data-built="1"' : ''}>`
      + `<td class="pt-name"><label class="pt-l"><input type="checkbox" class="pt-ck" aria-label="学完 ${esc(p.name)}"${t.done ? ' checked' : ''}><span class="pt-num">${p.n}</span></label>`
      + `<a href="${page(p)}" target="_blank" rel="noopener" lang="en" title="${esc(p.idea)}">${esc(p.name)}</a> `
      + `<a class="pt-day" href="AI_ENGINEER_TRANSITION_PLAN.html#day-${pad(d)}" target="_blank" rel="noopener" title="Day ${pad(d)} 学这个 pattern">(D${pad(d)})</a>`
      + `<button type="button" class="pt-tpl" data-p="${p.file}" data-name="#${p.n} ${esc(p.name)}" data-href="${page(p)}" title="写这个 pattern 的代码模板">&lt;/&gt; code template</button></td>`
      + `<td class="pt-lc">${p.lc.map(chip).join('')}<a class="pt-all" href="${DATA.repo}/blob/main/problems/README.md#${p.anchor}" target="_blank" rel="noopener">全部 ${p.count} 题 ↗</a></td>`
      + `<td>${esc(p.zh)}</td><td lang="en">${esc(p.when)}</td><td class="pt-cost">${esc(p.cost)}</td>`
      + `<td class="pt-nc"><textarea class="pt-note" rows="1" aria-label="${esc(p.name)} 的备注" placeholder="写备注…"></textarea></td></tr>`;
  };
  const stages = [1, 2, 3, 4];
  const range = s => { const ds = order.filter(p => p.stage === s).map(p => lessonDay[p.n]); return `Day ${pad(Math.min(...ds))}–${pad(Math.max(...ds))}`; };
  const cols = [['pattern', 'Pattern', 200], ['lc', 'LeetCode 题', 270], ['zh', '中文说明', 250], ['when', 'Recognize it when', 200], ['cost', 'Typical cost', 85], ['note', '备注', 230]];
  const body = stages.map(s => `<tr class="pt-stage"><td colspan="${cols.length}"><span>${STAGE_TEXT[s]} · ${range(s)} · <span data-stage-done="${s}">${order.filter(p => p.stage === s && ticks.get(p.file).done).length}</span> / ${order.filter(p => p.stage === s).length}</span></td></tr>`
    + order.filter(p => p.stage === s).map(rowHtml).join('')).join('');
  const stageLine = stages.map(s => `${DATA.stages[s]} <span data-stage-done="${s}">${order.filter(p => p.stage === s && ticks.get(p.file).done).length}</span> / ${order.filter(p => p.stage === s).length}`).join(' · ');
  const links = DATA.links.map((l, i) => `<a class="pt-link" href="${DATA.repo}/${l.path}" target="_blank" rel="noopener"><span class="pt-lt">${i + 1}. ${esc(l.title)}<span class="pt-tag"> - ${esc(l.tag)}</span></span><span class="pt-ld">${esc(l.zh)}</span></a>`).join('');
  const pct = (100 * done / order.length).toFixed(1) + '%';
  const panel = `<div class="rec-panel" data-tab="pattern" hidden>`
    + `<div class="rec-sum"><span class="rec-big">已学 <span class="pt-done">${done}</span> / ${order.length}<span class="muted"> 个 pattern</span></span>`
    + `<span class="rec-bar"><span class="pt-bar" style="width:${pct}"></span></span><span class="rec-line">${stageLine}</span><p class="rec-msg muted pt-msg"></p></div>`
    + `<div class="pt-links">${links}</div>`
    + `<p class="pt-hint muted">每天 08:30 Data Structure & Algo 一开始学一个（有几天两个），名字后面的 (D04) 是哪天学，勾选和时间表当天那一格是同一个勾。备注和学习记录里这个 pattern 的框是同一段，写在哪边都行，会自动保存。名字下面的 &lt;/&gt; code template 点开可以写这个 pattern 的代码模板，写过的带 ✓。拖表头右边的竖线可以改列宽（双击还原）；表格比页面宽时左右滑，Pattern 那一列不动。题目变绿带 ✓ 是在时间表里勾过（早上或 10:30 练习都算），后面的 D05 是计划哪天做，🔒 是会员题。<button type="button" class="pt-reset">列宽全部还原</button></p>`
    + `<div class="pt-wrap"><table class="pt-table" style="width:${cols.reduce((a, c) => a + c[2], 0)}px"><colgroup>${cols.map(([k, , w]) => `<col data-col="${k}" data-w="${w}" style="width:${w}px">`).join('')}</colgroup>`
    + `<thead><tr>${cols.map(([k, label]) => `<th scope="col" data-col="${k}">${label}<span class="pt-grip" role="separator" aria-orientation="vertical" title="拖动改列宽，双击还原"></span></th>`).join('')}</tr></thead>`
    + `<tbody>${body}</tbody></table></div>`
    + `<dialog class="pt-dlg" aria-labelledby="pt-dlg-t"><div class="pt-dlg-in"><div class="pt-dlg-h"><span class="pt-dlg-t" id="pt-dlg-t" lang="en"></span>`
    + `<a class="pt-dlg-ref" href="${DATA.repo}" target="_blank" rel="noopener">repo 里这个 pattern 的页面 ↗</a><span class="pt-dlg-s muted"></span>`
    + `<button type="button" class="pt-dlg-copy">复制</button><button type="button" class="pt-dlg-x">关闭</button></div>`
    + `<textarea class="pt-code" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="代码模板" placeholder="# 写这个 pattern 的 Python 模板，比如：&#10;def solve(nums):&#10;    ..."></textarea>`
    + `<p class="pt-dlg-f muted">自动保存 · Tab 缩进 4 格，Shift+Tab 减少缩进，回车保持缩进（冒号后面多缩进一层）· Esc 或点框外面关闭</p></div></dialog>`
    + `<p class="pt-credit muted">Pattern 的英文说明、Recognize it when、Typical cost 和题目分类来自 <a href="${DATA.repo}" target="_blank" rel="noopener">design-gurus/grokking-coding-interview</a>（CC BY 4.0）；题目换成了对应的 LeetCode 题，中文说明是自己写的。</p></div>`;
  return { panel, done, total: order.length };
}

const style = `<style>
.pt-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:0 0 10px}
a.pt-link{display:block;background:#fff;border:1px solid #dce4ea;border-radius:10px;padding:7px 11px;text-decoration:none;color:var(--ink);line-height:1.4}
a.pt-link:hover{border-color:var(--accent)}
.pt-lt{display:block;font-size:14.5px;font-weight:600;color:var(--accent)}
.pt-tag{font-weight:400;color:#33454f}
.pt-ld{display:block;font-size:13px;color:#526b7c;margin-top:2px}
.pt-hint{margin:0 0 6px;font-size:13px;line-height:1.5}
.pt-reset{margin-left:6px;padding:1px 8px;border:1px solid #c9d6de;border-radius:6px;background:#fff;font:inherit;font-size:12.5px;color:#33454f;cursor:pointer}
.pt-wrap{overflow-x:auto;border:1px solid #dce4ea;border-radius:10px;background:#fff}
table.pt-table{table-layout:fixed;border-collapse:separate;border-spacing:0;font-size:13.5px;line-height:1.4}
.pt-table th,.pt-table td{padding:4px 7px;border-bottom:1px solid #e6ecf0;vertical-align:top;overflow-wrap:anywhere;background:#fff}
.pt-table th{position:relative;font-size:13px;font-weight:600;color:#33454f;background:#f3f7f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pt-table th:first-child,.pt-table td.pt-name{position:sticky;left:0;z-index:2;box-shadow:1px 0 0 #dce4ea,4px 0 6px -4px rgba(24,52,73,.25)}
.pt-table th:first-child{z-index:3}
.pt-grip{position:absolute;top:0;right:0;width:9px;height:100%;cursor:col-resize;touch-action:none}
.pt-grip::after{content:"";position:absolute;top:22%;bottom:22%;right:3px;border-right:2px solid #c9d6de}
.pt-grip:hover::after,.pt-grip.on::after{border-color:var(--accent)}
tr.pt-stage td{background:#eef6f7;color:var(--accent);font-size:13px;font-weight:600;padding:5px 7px}
tr.pt-stage td>span{position:sticky;left:7px}
.pt-l{display:inline-flex;align-items:center;gap:4px;margin-right:5px;cursor:pointer}
.pt-ck{width:1.05em;height:1.05em;margin:0;accent-color:#2da44e;cursor:pointer}
.pt-num{min-width:1.4em;font-size:12px;color:#5b6b78;text-align:right}
.pt-name a{font-weight:600;text-decoration:none}
.pt-name a:hover,.pt-lc a:hover{text-decoration:underline}
tr.pt-row.done td{background:#f0fbf3}
tr.pt-row.done .pt-name a{color:#116329}
.pt-table td.pt-name a.pt-day{font-weight:400;font-size:12.5px;color:#5b6b78;white-space:nowrap}
.pt-lc{font-size:12px}
a.pt-q{display:inline-flex;align-items:baseline;max-width:100%;margin:0 3px 3px 0;padding:0 4px;border:1px solid #dce4ea;border-radius:5px;text-decoration:none;line-height:1.45;vertical-align:top}
.pt-qt{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pt-qd{flex:none;margin-left:4px;padding:0 3px;border-radius:3px;background:#eef2f5;color:#526b7c;font-size:11px}
a.pt-q.pt-ok{background:#dafbe1;border-color:#b6e3c1;color:#116329}
a.pt-q.pt-ok .pt-qt::before{content:"✓ ";font-weight:700}
a.pt-q.pt-ok .pt-qd{display:none}
a.pt-all{display:inline-block;font-size:12px;text-decoration:none;color:#526b7c}
.pt-cost{white-space:normal}
.pt-table td.pt-nc{padding:3px 5px}
textarea.pt-note{display:block;width:100%;box-sizing:border-box;min-height:calc(1.4em + 8px);max-height:16em;margin:0;padding:3px 6px;border:1px solid #dce4ea;border-radius:6px;background:#fbfcfd;font:inherit;line-height:1.4;color:var(--ink);resize:none;overflow-y:auto;field-sizing:content}
textarea.pt-note:hover{border-color:#c9d6de}
textarea.pt-note:focus{outline:none;border-color:var(--accent);background:#fff;box-shadow:0 0 0 2px rgba(20,110,120,.15)}
textarea.pt-note::placeholder{color:#9aa9b4}
.pt-credit{margin:8px 0 0;font-size:12.5px}
button.pt-tpl{display:block;margin:5px 0 1px;padding:1px 7px;border:1px dashed #c9d6de;border-radius:5px;background:#fff;font:12px/1.5 Consolas,"Courier New",monospace;color:#526b7c;cursor:pointer}
button.pt-tpl:hover{border-color:var(--accent);color:var(--accent)}
button.pt-tpl.has{border-style:solid;border-color:#a9d3d8;background:#eef6f7;color:var(--accent)}
button.pt-tpl.has::after{content:" ✓"}
dialog.pt-dlg{width:min(900px,calc(100vw - 32px));max-width:none;height:min(80vh,760px);max-height:calc(100vh - 32px);padding:0;border:1px solid #dce4ea;border-radius:12px;background:#fff;color:var(--ink);box-shadow:0 18px 48px rgba(16,45,62,.3)}
dialog.pt-dlg::backdrop{background:rgba(16,45,62,.45)}
.pt-dlg-in{display:flex;flex-direction:column;gap:8px;height:100%;box-sizing:border-box;padding:12px 14px}
.pt-dlg-h{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;line-height:1.4}
.pt-dlg-t{font-size:16.5px;font-weight:600}
.pt-dlg-ref{font-size:13.5px;text-decoration:none}
.pt-dlg-s{margin-left:auto;font-size:13px}
.pt-dlg-h button{padding:3px 12px;border:1px solid var(--accent);border-radius:6px;background:#fff;color:var(--accent);font:inherit;font-size:13.5px;cursor:pointer}
.pt-dlg-h .pt-dlg-x{background:var(--accent);color:#fff}
textarea.pt-code{flex:1;min-height:0;width:100%;box-sizing:border-box;margin:0;padding:10px 12px;border:1px solid #c9d6de;border-radius:8px;background:#102d3e;color:#e6f5f5;caret-color:#fff;font:14px/1.55 Consolas,"Courier New",monospace;tab-size:4;white-space:pre;overflow:auto;resize:none}
textarea.pt-code:focus{outline:2px solid rgba(20,110,120,.45);outline-offset:1px}
textarea.pt-code::placeholder{color:#7f9aab}
.pt-dlg-f{margin:0;font-size:12.5px}
@media(max-width:600px){dialog.pt-dlg{height:calc(100vh - 32px)}.pt-dlg-s{margin-left:0;flex-basis:100%}}
@media(max-width:600px){.pt-links{grid-template-columns:1fr 1fr;gap:6px}.pt-ld{display:none}a.pt-link{padding:6px 9px}.pt-lt{font-size:13.5px}}
</style>`;

// browser side of the Pattern tab: ticks (server, or this browser), 备注, column widths
function client() {
  var rows = [].slice.call(document.querySelectorAll('.pt-row')), table = document.querySelector('.pt-table');
  if (!table) return;
  var chips = [].slice.call(document.querySelectorAll('.pt-q[data-keys]'));   // planned problems: green once ticked
  var P = 'study-plan:', COLS = 'study-pattern-cols', online = false, last = {};   // last: the ticks the server sent
  // 备注: the same store as 学习记录 (POST /api/notes, Study notes/drafts.json); 'study-notes:' + key holds text the server
  // has not confirmed yet, or all of it without a server
  var NP = 'study-notes:', boxes = [].slice.call(document.querySelectorAll('.pt-note')), timer = {};
  var autosize = !(window.CSS && CSS.supports && CSS.supports('field-sizing', 'content'));
  var web = location.protocol !== 'file:' && ['127.0.0.1', 'localhost'].indexOf(location.hostname) < 0;
  function ls(k, v) { try { if (arguments.length > 1) { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); return null; } return localStorage.getItem(k); } catch (e) { return null; } }
  function $$(sel) { return [].slice.call(document.querySelectorAll(sel)); }
  function msg(t) { $$('.pt-msg').forEach(function (el) { el.textContent = t; }); }
  // has(key): is this tick checked; built: also count what was checked when the page was generated (no server)
  function paint(has, built) {
    function on(el, keys) { return keys.some(has) || (built && el.dataset.built === '1'); }
    rows.forEach(function (r) { var d = on(r, [r.dataset.key]); r.classList.toggle('done', d); r.querySelector('.pt-ck').checked = d; });
    chips.forEach(function (c) { c.classList.toggle('pt-ok', on(c, c.dataset.keys.split(' '))); });
    var done = rows.filter(function (r) { return r.classList.contains('done'); });
    $$('.pt-done').forEach(function (el) { el.textContent = done.length; });
    $$('.pt-bar').forEach(function (el) { el.style.width = (100 * done.length / rows.length).toFixed(1) + '%'; });
    $$('[data-stage-done]').forEach(function (el) { el.textContent = done.filter(function (r) { return r.dataset.stage === el.dataset.stageDone; }).length; });
    $$('.rec-tab-n[data-tab="pattern"]').forEach(function (el) { el.textContent = done.length + ' / ' + rows.length; });
  }
  function offline() {
    online = false;
    paint(function (k) { return ls(P + k) === '1'; }, true);
    msg(web ? '网页版：显示的是上次推送到 GitHub 时的进度；在这里打勾只存在这台设备的浏览器里' : '没有连接本地服务器：打勾只存在这个浏览器里，不会写进时间表');
  }
  function getJson(url) { return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  function post(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Study': '1' }, body: JSON.stringify(body) })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); });
  }
  // 备注 boxes: one line high, growing with the text (field-sizing where the browser has it, otherwise measured while visible)
  function grow(t) { if (!autosize || !t.offsetParent) return; t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
  function growAll() { boxes.forEach(grow); }
  function keyOf(t) { return t.closest('.pt-row').dataset.key; }
  // saved: the notes of the server (or of GitHub on the web version); a box being typed in is left alone
  function fillNotes(saved) {
    boxes.forEach(function (t) {
      var k = keyOf(t), local = ls(NP + k), v = saved[k] || '';
      if (timer[k] || document.activeElement === t) return;
      if (local != null && local !== v) {
        v = local;
        if (online) post('/api/notes', { key: k, text: local }).then(function () { if (ls(NP + k) === local) ls(NP + k, ''); }).catch(function () {});
      } else if (local != null && online) ls(NP + k, '');
      t.value = v;
    });
    growAll();
  }
  function load() {
    if (location.protocol === 'file:') { offline(); return fillNotes({}); }
    getJson('/api/progress').then(function (st) {
      online = true;
      last = st.ticks || {};
      paint(function (k) { return !!last[k]; }, false);
      msg('已连接本地服务器：打勾会同时勾上时间表当天 Data Structure & Algo 那一格的 pattern，备注会写进学习记录');
      getJson('/api/notes').then(function (j) { fillNotes(j.notes || {}); }, function () { msg('读取备注失败，刷新页面再试'); });
      getJson('/api/templates').then(fillTpls, function () { msg('读取代码模板失败，刷新页面再试'); });
    }, function () {
      offline();
      // web version: the notes and templates as last pushed to GitHub, plus what was written in this browser
      getJson('../Study%20notes/drafts.json').then(fillNotes, function () { fillNotes({}); });
      getJson('../Study%20notes/pattern-templates.json').then(fillTpls, function () { fillTpls({}); });
    });
  }

  // code template: one per pattern (keyed by its page's file name), edited in a dialog. POST /api/templates writes
  // Study notes/pattern-templates.json; 'study-tpl:' + pattern holds code the server has not confirmed yet, or all of it
  // without a server
  var TP = 'study-tpl:', tpls = {}, tbtns = [].slice.call(document.querySelectorAll('.pt-tpl'));
  var dlg = document.querySelector('.pt-dlg'), code = dlg && dlg.querySelector('.pt-code'), cur = null, pend = null, ttimer = null;
  function tplOf(p) { var l = ls(TP + p); return l != null ? l : ((tpls[p] || {}).code || ''); }
  function markTpl() { tbtns.forEach(function (b) { b.classList.toggle('has', !!tplOf(b.dataset.p).trim()); }); }
  function tstat(t) { if (dlg) dlg.querySelector('.pt-dlg-s').textContent = t; }
  function fillTpls(saved) {
    tpls = saved || {};
    tbtns.forEach(function (b) {
      var p = b.dataset.p, l = ls(TP + p), v = (tpls[p] || {}).code || '';
      if (l == null || p === cur || !online) return;
      if (l === v) { ls(TP + p, ''); return; }
      post('/api/templates', { pattern: p, code: l }).then(function () { tpls[p] = { code: l }; if (ls(TP + p) === l) ls(TP + p, ''); }).catch(function () {});
    });
    markTpl();
  }
  function flush() {
    if (!pend) return;
    var p = pend.p, v = pend.v;
    pend = null; clearTimeout(ttimer);
    post('/api/templates', { pattern: p, code: v })
      .then(function () { tpls[p] = { code: v }; if (ls(TP + p) === v) ls(TP + p, ''); markTpl(); if (cur === p) tstat('已保存'); })
      .catch(function () { if (cur === p) tstat('保存到服务器失败，已先存在这个浏览器里'); });
  }
  if (dlg && code) {
    document.body.appendChild(dlg);   // outside the tab panel, which may be hidden
    tbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        cur = b.dataset.p;
        dlg.querySelector('.pt-dlg-t').textContent = b.dataset.name + ' · code template';
        dlg.querySelector('.pt-dlg-ref').href = b.dataset.href;
        code.value = tplOf(cur);
        tstat(online ? '自动保存到 Study notes/pattern-templates.json' : web ? '网页版：只存在这台设备的浏览器里' : '没有连接本地服务器：先存在这个浏览器里');
        dlg.showModal();
        code.focus();
        code.setSelectionRange(0, 0);
        code.scrollTop = 0;
      });
    });
    code.addEventListener('input', function () {
      var p = cur, v = code.value;
      if (!p) return;
      ls(TP + p, v);
      markTpl();
      if (!online) return;
      pend = { p: p, v: v };
      tstat('保存中…');
      clearTimeout(ttimer);
      ttimer = setTimeout(flush, 600);
    });
    // insertText keeps the browser's undo; setRangeText where it is not supported
    var insert = function (t) {
      if (!(document.execCommand && document.execCommand('insertText', false, t))) {
        code.setRangeText(t, code.selectionStart, code.selectionEnd, 'end');
        code.dispatchEvent(new Event('input'));
      }
    };
    var dedent = function () {
      var s = code.value, a = code.selectionStart, b = code.selectionEnd, st = s.lastIndexOf('\n', a - 1) + 1, first = 0, total = 0;
      var out = s.slice(st, b).split('\n').map(function (l, i) { var n = l.match(/^ {0,4}/)[0].length; if (!i) first = n; total += n; return l.slice(n); }).join('\n');
      if (!total) return;
      code.setRangeText(out, st, b, 'preserve');
      code.setSelectionRange(Math.max(st, a - first), Math.max(st, b - total));
      code.dispatchEvent(new Event('input'));
    };
    code.addEventListener('keydown', function (e) {
      if (e.isComposing) return;
      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (e.shiftKey) dedent(); else insert('    ');
      } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        var s = code.value, i = code.selectionStart, line = s.slice(s.lastIndexOf('\n', i - 1) + 1, i), ind = line.match(/^[ \t]*/)[0];
        if (/:\s*(#.*)?$/.test(line)) ind += '    ';
        e.preventDefault();
        insert('\n' + ind);
      }
    });
    dlg.querySelector('.pt-dlg-x').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.pt-dlg-copy').addEventListener('click', function () {
      if (!navigator.clipboard) { code.select(); return tstat('已选中，按 Ctrl+C 复制'); }
      navigator.clipboard.writeText(code.value).then(function () { tstat('已复制'); }, function () { code.select(); tstat('已选中，按 Ctrl+C 复制'); });
    });
    // a click on the backdrop (pressed and released outside the box) closes it; selecting text past the edge does not
    var downOut = false;
    dlg.addEventListener('pointerdown', function (e) { downOut = e.target === dlg; });
    dlg.addEventListener('click', function (e) { if (downOut && e.target === dlg) dlg.close(); downOut = false; });
    dlg.addEventListener('close', function () { flush(); cur = null; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  }
  boxes.forEach(function (t) {
    t.addEventListener('input', function () {
      var k = keyOf(t), v = t.value;
      grow(t);
      ls(NP + k, v);
      if (!online) return;
      clearTimeout(timer[k]);
      timer[k] = setTimeout(function () {
        post('/api/notes', { key: k, text: v })
          .then(function () { delete timer[k]; if (t.value === v) ls(NP + k, ''); msg('备注已保存（和学习记录里这个 pattern 的框是同一段）'); })
          .catch(function () { delete timer[k]; msg('备注保存到服务器失败，已先存在这个浏览器里'); });
      }, 500);
    });
  });
  // a hidden tab has no size: measure the boxes again when the Pattern tab is opened
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.rec-tabs button')) setTimeout(growAll, 0); });
  window.addEventListener('hashchange', function () { setTimeout(growAll, 0); });
  window.addEventListener('resize', growAll);
  rows.forEach(function (r) {
    var box = r.querySelector('.pt-ck');
    box.addEventListener('change', function () {
      var on = box.checked;
      var key = r.dataset.key;
      ls(P + key, on ? '1' : '');
      if (!online) { paint(function (k) { return ls(P + k) === '1'; }, true); return; }
      post('/api/progress', { key: key, done: on, label: r.dataset.label })
        .then(function (j) { last = (j.state && j.state.ticks) || {}; paint(function (k) { return !!last[k]; }, false); })
        .catch(function () { paint(function (k) { return k === key ? on : !!last[k]; }, false); msg('保存到服务器失败，已先存在这个浏览器里'); });
    });
  });
  // column widths: drag the grip at the right edge of a header, double-click to reset; saved in this browser as
  // {column: width}, only the columns that were changed. Older pages saved an array of all six widths: read those by
  // their old columns, keeping only the ones that differed from the old defaults
  var cols = [].slice.call(table.querySelectorAll('col')), DEF = cols.map(function (c) { return +c.dataset.w; });
  var NAMES = cols.map(function (c) { return c.dataset.col; }), widths = DEF.slice();
  try {
    var saved = JSON.parse(ls(COLS) || 'null');
    if (Array.isArray(saved)) {
      var OLD = [['pattern', 170], ['lc', 260], ['zh', 240], ['when', 190], ['cost', 80], ['days', 100]], o = {};
      saved.forEach(function (w, i) { if (OLD[i] && +w !== OLD[i][1]) o[OLD[i][0]] = +w; });
      saved = o;
    }
    if (saved) widths = NAMES.map(function (n, i) { return saved[n] ? Math.max(48, +saved[n] || DEF[i]) : DEF[i]; });
  } catch (e) {}
  function apply() {
    cols.forEach(function (c, i) { c.style.width = widths[i] + 'px'; });
    table.style.width = widths.reduce(function (a, b) { return a + b; }, 0) + 'px';
  }
  function save() {
    var o = {}, any = false;
    NAMES.forEach(function (n, i) { if (widths[i] !== DEF[i]) { o[n] = widths[i]; any = true; } });
    ls(COLS, any ? JSON.stringify(o) : '');
    growAll();
  }
  apply();
  [].slice.call(table.querySelectorAll('.pt-grip')).forEach(function (g, i) {
    g.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var x0 = e.clientX, w0 = widths[i];
      g.classList.add('on');
      g.setPointerCapture(e.pointerId);
      function move(ev) { widths[i] = Math.max(48, Math.round(w0 + ev.clientX - x0)); apply(); }
      function up() { g.classList.remove('on'); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); save(); }
      g.addEventListener('pointermove', move);
      g.addEventListener('pointerup', up);
      g.addEventListener('pointercancel', up);
    });
    g.addEventListener('dblclick', function () { widths[i] = DEF[i]; apply(); save(); });
  });
  var reset = document.querySelector('.pt-reset');
  if (reset) reset.addEventListener('click', function () { widths = DEF.slice(); apply(); save(); });
  load();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
}

// how build.cjs lays out the Data Structure & Algo cell (its Markdown parts): the "… N mins：" lines and the pattern lines
// in the left column, the problems under each of them on the right
const layout = parts => parts.map(p => {
  const t = p.replace(/\s*[☐☑]\s*$/, '');
  return /：$/.test(t) || (/\/patterns\/[\w-]+\.md\)/.test(t) && !/ · /.test(t)) ? 'label' : 'item';
});

module.exports = { DATA, ORDER, SCHEDULE, FIRST, MIXED, EXTRA, block, tip, topic, topicText, tab, style, client, lessonDay, layout };
