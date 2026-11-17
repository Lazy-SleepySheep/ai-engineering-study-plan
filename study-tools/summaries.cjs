// Summary notes of the Hello Interview articles as HTML pages: each note in the "summary" map of
// hello-interview-local.json (Markdown in the Obsidian vault) becomes resource/Summary/<vault folder>/<note>.html, the page
// the timetable's "Summary" links open.
//   - the vault is found by its name (LOCAL.vault) in Obsidian's own list of vaults (%APPDATA%/obsidian/obsidian.json), so
//     no local path is written into the repo; without the vault (another computer) nothing is generated
//   - Markdown -> HTML with marked, which is not a dependency of this repo: one installed with npm, otherwise the copy that
//     comes with the Codex runtime; without it nothing is generated. $…$ formulas are kept away from marked and shown with
//     KaTeX (cdnjs; offline they stay as text)
//   - file:/// links (the 来源 line) point into resource/ when the file is there, shown as 本地连接: by its path inside this repo, otherwise
//     by its name among the downloaded System Design pages
//   - each page starts with the article's links: the day it is read, 网页, 本地连接 and the note in Obsidian
// The pages are committed with the rest of resource/. build.cjs runs this; on its own: node study-tools/summaries.cjs
const fs = require('fs'), path = require('path'), os = require('os');
const hi = require('./hello-interview.cjs');

const root = path.resolve(__dirname, '..');
const RUNTIME = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/marked');
const SD_HTML = 'resource/Hello_Interview_System_Design/HTML';
const KATEX = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9';
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function loadMarked() {
  for (const m of ['marked', RUNTIME]) { try { return require(m).marked; } catch (e) { /* try the next */ } }
  return null;
}
function vaultDir() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA || '', 'obsidian', 'obsidian.json'), 'utf8'));
    const v = Object.values(j.vaults || {}).find(x => path.basename(x.path) === hi.LOCAL.vault);
    return v && fs.existsSync(v.path) ? v.path : '';
  } catch (e) { return ''; }
}
// a link from the page "from" to "to" (both relative to the repo root, "to" may end with #section)
const rel = (from, to) => { const [f, h] = to.split('#'); return hi.enc(path.posix.relative(path.posix.dirname(from), f)) + (h ? '#' + h : ''); };
// a file:/// link: into resource/ when the file is there, otherwise unchanged
function fileLink(href, from) {
  let u; try { u = new URL(href); } catch (e) { return href; }
  const p = decodeURIComponent(u.pathname).replace(/^\/([A-Za-z]:)/, '$1'), inRepo = path.relative(root, p);
  let to = '';
  if (inRepo && !inRepo.startsWith('..') && !path.isAbsolute(inRepo) && fs.existsSync(p)) to = inRepo.split(path.sep).join('/');
  else if (fs.existsSync(path.join(root, SD_HTML, path.basename(p)))) to = SD_HTML + '/' + path.basename(p);
  return to ? rel(from, to + u.hash) : href;
}
// Markdown -> HTML: front matter dropped, [[wiki links]] as their text, formulas outside code kept for KaTeX
function toHtml(md, marked, from) {
  md = md.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '').replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (m, a, b) => b || a);
  const code = [], math = [];
  md = md.replace(/```[\s\S]*?```|`[^`\n]+`/g, m => `CODE${code.push(m) - 1}CODE`)
    .replace(/\$\$[\s\S]+?\$\$|\$(?=\S)[^$\n]+?(?<=\S)\$/g, m => `MATH${math.push(m) - 1}MATH`)
    .replace(/CODE(\d+)CODE/g, (m, i) => code[+i]);
  return marked.parse(md, { gfm: true })
    .replace(/MATH(\d+)MATH/g, (m, i) => esc(math[+i]))
    // a file:/// link that now points into resource/ reads 本地连接 instead of the old path
    .replace(/<a href="(file:[^"]+)">([^<]*)<\/a>/g, (m, h, t) => {
      const to = fileLink(h.replace(/&amp;/g, '&'), from);
      return to.startsWith('file:') ? m : `<a href="${to}">${t.startsWith('file:') ? '本地连接' : t}</a>`;
    })
    .replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
}
function page(id, body, from, hasMath) {
  const p = hi.PAGE.get(id), day = hi.LEARNED.get(id), local = hi.LOCAL.pages[p.url];
  const links = [
    `<a href="${rel(from, 'Reports/AI_ENGINEER_TRANSITION_PLAN.html')}#day-${pad(day)}">Day ${pad(day)} 读</a>`,
    `<a href="${esc(p.url)}">网页</a>`,
    ...(local ? [`<a href="${rel(from, local)}">本地连接</a>`] : []),
    `<a href="${esc(hi.obsidianOf(id))}">在 Obsidian 里打开</a>`,
  ].join(' · ');
  const math = hasMath ? `<link rel="stylesheet" href="${KATEX}/katex.min.css"><script defer src="${KATEX}/katex.min.js"></script><script defer src="${KATEX}/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})"></script>` : '';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} · Summary</title><link rel="stylesheet" href="${rel(from, 'Study topics/style.css')}">${math}<style>article{background:#fff;border:1px solid #dce4ea;border-radius:12px;padding:8px 24px 20px}article h1{font-size:26px}article table{margin:10px 0}article li{margin:4px 0}@media(max-width:600px){article{padding:4px 14px 14px}}</style></head><body><main><p class="muted">${p.group} · ${links}</p><article>${body}</article></main></body></html>\n`;
}

function generate() {
  const marked = loadMarked(), vault = vaultDir();
  if (!marked || !vault) { console.log(`Summary pages: skipped (${!marked ? 'marked' : 'the Obsidian vault ' + hi.LOCAL.vault} not found)`); return 0; }
  let n = 0;
  for (const [id, note] of Object.entries(hi.LOCAL.summary)) {
    const src = path.join(vault, note), out = hi.summaryHtml(id);
    if (!fs.existsSync(src)) throw Error('summaries: no note ' + note);
    const md = fs.readFileSync(src, 'utf8'), body = toHtml(md, marked, out);
    fs.mkdirSync(path.dirname(path.join(root, out)), { recursive: true });
    fs.writeFileSync(path.join(root, out), page(id, body, out, /\$[^$\n]+\$/.test(md)));
    n++;
  }
  console.log('Summary pages: ' + n);
  return n;
}

module.exports = { generate };
if (require.main === module) generate();
