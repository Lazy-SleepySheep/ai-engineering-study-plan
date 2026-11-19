const fs=require('fs'),path=require('path'),assert=require('assert');
require('./layout.cjs'); // keep reports in Reports/ (moved to the root only while this script runs)
process.chdir(path.resolve(__dirname,'..'));
const manifest=JSON.parse(fs.readFileSync('study-tools/manifest.json'));
const original=require('./reschedule.cjs').plan(fs.readFileSync('study-tools/original-plan.md','utf8')),plan=fs.readFileSync('AI_ENGINEER_TRANSITION_PLAN.md','utf8');
const questions=s=>s.match(/^- Q\d{3}[^\r\n]+/gm)||[];
assert.deepStrictEqual(questions(plan),questions(original));assert.equal(questions(plan).length,623);
// every day has the same morning problems as the plan (the Data Structure & Algo row orders them: the day's pattern
// first); the practice and mixed-recognition problems of the patterns are in that row too and are left out here
const extra=require('./patterns.cjs').EXTRA,lc=s=>[...s.matchAll(/<a id="(day-\d+)"><\/a>([\s\S]*?)(?=<a id="day-|$)/g)].map(([,d,b])=>d+':'+(b.match(/https:\/\/leetcode.com\/problems\/[^)]+/g)||[]).filter(u=>!extra.has(u.split('/')[4])).sort().join());assert.deepStrictEqual(lc(plan),lc(original));
const patternRows=(plan.match(/^\| 08:30–11:15[^\r\n]*/gm)||[]).join('\n');
for(const p of require('./patterns.cjs').DATA.patterns)assert.equal((patternRows.match(new RegExp('/patterns/'+p.file+'\\.md\\)','g'))||[]).length,1,'pattern scheduled once: '+p.name);
assert.equal(manifest.days.length,45);
// Hello Interview: each planned day has its row and its ☐ line ("<kind>：<title>"; the article lines before it, "Title (20mins)", have their own ☐)
for(const it of require('./hello-interview.cjs').DATA.items){const b=plan.split(`<a id="day-${String(it.day).padStart(2,'0')}"></a>`)[1].split('<a id="day-')[0];assert((b.match(/^\| 13:45–15:45 \| Hello Interview，2 小时 \| (?:[^|\r\n]*?<br>)?(?:System Design|AI Coding|基础|复盘)：[^☐☑|<]*[☐☑]/m)||[]).length===1,'Hello Interview day '+it.day);}
// every learning page of Hello Interview is read once, in the 13:45 row of its day
{const hi=require('./hello-interview.cjs'),rx=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');for(const [id,day] of hi.LEARNED){const p=hi.PAGE.get(id),b=plan.split('<a id="day-'+String(day).padStart(2,'0')+'"></a>')[1].split('<a id="day-')[0],read='\\['+rx(p.title)+'\\]\\('+rx(p.url)+'\\) \\(\\d+mins\\)([^☐☑<|]*)[☐☑]';assert.equal((plan.match(new RegExp(read,'g'))||[]).length,1,'Hello Interview page read once: '+id);const m=new RegExp('^\\| 13:45[^\\r\\n]*?'+read,'m').exec(b);assert(m,'Hello Interview page on its day: '+id);for(const u of [hi.localOf(p.url),hi.summaryOf(id)])if(u)assert(m[1].includes('('+u+')'),'Hello Interview page links its local copy and summary: '+id);}}
const blocks=[...plan.matchAll(/<a id="day-(\d+)"><\/a>([\s\S]*?)(?=<a id="day-|$)/g)];assert.equal(blocks.length,45);
for(const [_,day,block]of blocks){for(const slot of ['08:30–11:15','11:15–13:15','13:45–15:45','15:45–16:45','16:45–17:45','17:45–18:00'])assert(block.includes(slot),`day ${day} missing ${slot}`);}
const files=['AI_ENGINEER_TRANSITION_PLAN.html','AI_ENGINEER_DAILY_LEARNING_GUIDE.html','AI_ENGINEER_PROJECT_ROADMAP.html',...['AI_ENGINEER_STUDY_LOG.html','AI_ENGINEER_STUDY_NOTES.html','AI_ENGINEER_TOP150_RECORD.html','AI_ENGINEER_VIDEOS.html','AI_ENGINEER_THOUGHTS.html'].filter(f=>fs.existsSync(f)),...fs.readdirSync('Study topics').filter(f=>f.endsWith('.html')).map(f=>'Study topics/'+f)];
// obsidian: links open the Obsidian vault; resource/ (downloaded Hello Interview pages) is checked only where it
// exists, and a file there that git ignores (the videos, the pages over 100 MB) may be missing on another computer:
// that is a warning, not an error (on the computer with the downloads it means a file was renamed or moved);
// an anchor can also be a page of a single-page guide (data-page="...", the AI Coding index.html)
let links=0;const broken=[],localMissing=new Set();const readCache=new Map(),readOnce=t=>{if(!readCache.has(t))readCache.set(t,fs.readFileSync(t,'utf8'));return readCache.get(t)};
const localOnly=t=>{try{require('child_process').execFileSync('git',['check-ignore','-q',t],{stdio:'ignore'});return true}catch(e){return false}};
for(const file of files){const html=fs.readFileSync(file,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file+' H1');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,file+' duplicate id');for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|data:|mailto:|obsidian:)/.test(m[1]))continue;if(/^(\.\.\/)*resource\//.test(m[1])&&!fs.existsSync('resource'))continue;links++;const [raw,anchor]=m[1].split('#'),target=raw?path.resolve(path.dirname(file),decodeURIComponent(raw)):path.resolve(file);if(!fs.existsSync(target)){if(/^(\.\.\/)*resource\//.test(raw)&&localOnly(target))localMissing.add(path.relative('.',target));else broken.push({file,link:m[1]});continue}if(anchor&&target.endsWith('.html')&&!readOnce(target).includes(`id="${anchor}"`)&&!readOnce(target).includes(`data-page="${anchor}"`))broken.push({file,link:m[1],reason:'missing anchor'});}}
assert.deepStrictEqual(broken,[]);if(localMissing.size)console.warn(`Warning: ${localMissing.size} linked local file(s) in resource/ (not in git) are missing:\n  `+[...localMissing].join('\n  '));
for(const r of manifest.records){assert(r.days.length>0||r.module==='ML'||r.module.endsWith('System Design'),r.name);   // ML and System Design lessons are no longer scheduled
assert(fs.existsSync(`Study topics/${r.id}.html`));}
const result={days:45,mainHours:360,bufferHours:45,questions:623,questionsUnchanged:true,leetcodeLinksUnchanged:true,topicPages:manifest.records.length,notebooks:fs.readdirSync('notebook').filter(f=>f.endsWith('.ipynb')).length,helloInterviewDays:require('./hello-interview.cjs').DATA.items.length,localLinksChecked:links,brokenLinks:0};fs.writeFileSync('study-tools/validation.json',JSON.stringify(result,null,2));console.log(result);
