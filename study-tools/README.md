# 学习资料维护

内容源：`coding.cjs`、`sql.cjs`、`ml.cjs`、`design.cjs`、`concepts.cjs`。`build.cjs`生成三个MD/HTML、Topic Library和notebooks，`enrich.cjs`补充独立ML条目和技术参考。

`original-plan.md`与`original-roadmap.md`是本次更新前的只读输入快照，用于保留623条原题、LeetCode链接与项目基础路线；它们不是当前学习入口。当前入口在仓库根目录。

## 生成与检查

```powershell
node study-tools/build.cjs
node study-tools/validate.cjs
.\.study-venv\Scripts\python.exe study-tools/verify_notebooks.py
```

重新生成时，未修改cell source的notebook保留运行输出；修改过的notebook需要再次执行验证。`validation.json`核对日期、课时、题库与本地链接；`notebook-validation.json`记录独立kernel执行结果。`requirements-lock.txt`记录本次验证环境的确切版本。

`preview.cjs`是当前机器上的可选浏览器检查，使用已安装Edge和Codex提供的Playwright；不影响资料本身运行。页面是本地静态HTML，无CDN或服务器依赖。

## 来源与范围

## LeetCode Pattern排期维护

`patterns.cjs`写时间表每天08:30–11:15的Data Structure & Algo那一格（`block`，把早上的题和当天的pattern放在一起）和刷题记录的Pattern选项卡，数据在`patterns.json`：

- 41个pattern来自[design-gurus/grokking-coding-interview](https://github.com/design-gurus/grokking-coding-interview)（CC BY 4.0）：英文名、Recognize it when、Typical cost和核心思路（鼠标停在名字上显示）照抄repo，中文说明是自己写的
- `lc` - repo里每个pattern的题换成对应的LeetCode题（题号、slug、标题、难度、是否会员题、是否补充题），2026-11-12用LeetCode GraphQL逐个核对过题号、标题和会员题。repo没有对应LeetCode题的不放；免费题不够练习时加了几道补充题
- `plan` - 早上刷题计划里每道LeetCode题属于哪个pattern（`null`表示不属于这41个），用来算“刷”的那几天。早上的题加了或删了，生成会报错提醒补上
- 时间表里这一格（2小时45分钟）：先是pattern链接和它的时间，比如“#29 Prefix Sum（65mins）：”（读讲义15分钟、两道练习题30分钟，加上早上排的同pattern的题；两个一天时第一个只有链接，第二个写两个合起来的时间，读讲义各10分钟、练习题25分钟），下面是练习题和早上排的同pattern的题（`plan`对得上当天pattern的），从易到难；SQL日接着“SQL 60 mins：”；“其他题 N mins：”是其余的题（Day 01–03没有pattern，叫“刷题”）；最后“复习 N mins：”，每道复习题后面写着第一次做的那天（“复习 · Day 01 做过”，链接到那一天，由`reschedule.cjs`从`top150-schedule.json`算出；加这个时复习题还没有勾和笔记，所以没有搬键）。分钟数按Easy 15、Medium 20、Hard 30、工程实现题30、复习10算，练习题两道算30（两个pattern时25）。混合识别是“混合识别 40 mins（题目不标 pattern）：”加4道题，放在最前面。原来早上第一行的Study topic和“资料：”链接去掉了。每道题那一行的文字没变，所以勾选的键也没变；pattern那一行2026-11-16从“读讲义 15 mins：#9 Hash Maps”改成现在的写法，已有的勾和学习记录搬到了新键。网页上这一格分两栏：pattern和“… N mins：”在左栏，它下面的题在右栏（`patterns.cjs`的`layout`，`build.cjs`的`grid`）。做法提示放在当天的“学习提示”里
- 排期在`patterns.cjs`的`ORDER`：Day 01–03跳过；Day 04 Hash Maps、Day 05 Two Pointers；2026-11-16起Day 06–41的顺序跟着早上的Study topic走（Day 08 Sliding Window、Day 10 Stacks、Day 13链表……），基本一天一个，Day 11 Top K和K-way Merge一天，最后几天偏门的两个一天；Day 42–45混合识别
- 早上的Top 150题（`top150-schedule.json`的`top`）跟着pattern排：每道题放在它的pattern（`patterns.json`的`plan`）那天，放不下就顺延到后面有空的日子，不会排在pattern之前；原计划的题（`own`）和复习题不动，Hard仍在Day 35–41，按相近的pattern放在一起。没有pattern的数学题跟Bitwise XOR一起，Construct Quad Tree跟Tree DFS一起。Day 31–34和Hard那几天学的是题库里没有对应题的pattern，早上做前面学过的pattern的剩余题。改排期时保持这几条，并核对115道Top 150题一道不少、每天不超时（`spare_min`不为负）
- 练习题自动挑：免费、不在早上的计划里、不重复，从简单的开始，一天两道（偏门的一个pattern一道）；混合识别每天4道，题目不标pattern
- 改了排期或题目后运行`node study-tools/build.cjs`；`validate.cjs`会核对41个pattern各排了一次，早上的LeetCode链接没变

## Hello Interview排期维护

`hello-interview.cjs`写时间表每天13:45–15:45那一格（2小时，System Design + AI Coding）和刷题记录的Hello Interview选项卡，数据在`hello-interview.json`：

- `items` - 每天一项：题目、任务、类型（System Design、AI Coding、基础、复盘）、所在的周、Hello Interview的链接（标题只写名字，时间表按网址分成“讲义：”（其他阅读，比如Delivery Framework）、“题解：”（problem-breakdowns）、“练习题：”（practice），按这个顺序放在同一行，用“，”隔开）；`hi`是原来30天计划里的Day，只用来对照，不显示。2026-11-16起题库里的System Design 32道和AI Coding 13道全部排进来，每道一次：原来的自选日、自拟场景Mock、重做日和基础、复盘日（Day 35 AI Coding流程查漏、Day 42重做最弱的Coding除外）都换成了具体的题，System Design有6天是两道考点相近的题一天，学习提示里用`method`的“System Design 两道”（各1小时）。`validate.cjs`不查这一点，`hi-problems.cjs`的刷题记录选项卡会显示哪道没安排。原计划的链接在2026-11-12核对过，新加的题解、练习和讲义链接在2026-11-16核对过
- `learn` - 这天先读的讲义（`hello-interview-problems.json`里`learn`的`id`），见下面的“讲义”
- `sections` - 每周的名字和目标，每周第一天的“学习提示”里写本周目标；`method` - 每种类型的2小时怎么分；`record` - 每天记什么
- Day 01–03这一格原来是General & AI System Design：那天勾过的保留（勾选不丢），没勾的写“跳过”
- 讲义 - Hello Interview的学习页：System Design的Core Concepts 9篇、Patterns 7篇、Key Technologies 10篇，AI Coding的Common Patterns 7篇，共33篇，网址和每道题用到哪几篇在`hello-interview-problems.json`。每篇只读一次，排在第一道用到它的题那天或之前（`hello-interview.cjs`会检查，排晚了或漏排、重复都会报错），一道题的天一般最多两篇，Day 04没有题排三篇，两道题一天的只在Day 21排一篇（Real-time Updates，两道题都靠它）。这一格开头是“Material”，下面是讲义，每篇一行、一个☐，写成“Handling Large Blobs (20mins)（本地连接 · Summary）”：标题链到网站，后面是分钟数（一篇30分钟，两三篇各20分钟）；接着“Review”，下面是这天的题也用到、但之前已经读过的讲义，每篇一行，写着哪天读的（“ZooKeeper（Day 10 学过 · 本地连接 · Summary）”，没有☐，不另算时间）；然后是这天的☐，题目后面写着2小时剩下的时间（比如“System Design：Design Dropbox (80mins)”，没读讲义的天不写），下一行是任务，最后一行是这天的链接，放在“［ ］”里，讲义、题解、练习题用“，”隔开（“［题解：Dropbox（本地连接），练习题：Guided Practice］”）。网页上这一格分两栏：Material和Review在左栏，讲义在右栏，题目（加粗）和任务占整行，链接在右栏，“［”挂在外面，“题解”和上面的讲义标题对齐（`hello-interview.cjs`的`layout`）。学习记录里每篇讲义一个框
- 每天一个☐（写“类型：题目”，比如“System Design：Design Bitly”，不写Hello Interview原计划自己的天数），刷题记录的Hello Interview选项卡每周一列，按System Design、AI Coding、基础与复盘计数
- 本地副本和Summary - `hello-interview-local.json`：`pages`是网址到本地文件（相对仓库根目录，在`resource/`，下载的网页；视频和7个嵌了视频、超过GitHub 100MB上限的题解页面不进git，见`.gitignore`，这7个只在本机能打开；AI Coding的讲义和题解都在`resource/Hello_Interview_AI_Coding/index.html`里，`#`后面是章节，比如`#greedy-algorithms`），`summary`是讲义`id`到Obsidian库`JuJu_Workspace`里的笔记（System Design在`02_Knowledge/Programming/system_design/`，AI Coding在`02_Knowledge/Programming/AI_Coding/`）。时间表里讲义和题解的标题仍链到网站，后面加“（本地连接 · Summary）”，Summary链到`summaries.cjs`从这些笔记生成的HTML（`resource/Summary/<文件夹>/<笔记名>.html`，进git；每次运行`build.cjs`都会从Obsidian库重新生成，所以改了笔记再运行一次就行；页面顶部是当天、网页、本地连接和“在 Obsidian 里打开”；Markdown用`marked`转换，公式用KaTeX显示；找不到Obsidian库或`marked`时跳过），Review下面写“（Day NN 学过 · 本地连接 · Summary）”；练习题和刷题记录不变。`missing`记着本地没有的：Temporal讲义、Flash Sale题解，没有Summary的Consistent Hashing、CAP Theorem。补了文件就把它加进`pages`或`summary`，再运行`node study-tools/build.cjs`
- 改了以后运行`node study-tools/build.cjs`；`validate.cjs`会核对每个计划日都有这一行和这天的☐，每篇讲义在它那天读一次、本地连接和Summary都在；`resource/`里的本地链接只在这台电脑有`resource/`时检查

`hi-problems.cjs`写刷题记录的System Design和AI Coding两个选项卡，数据在`hello-interview-problems.json`：

- 题单 - Hello Interview题库的全部练习题，2026-11-16从网站的practice页读取：System Design 32道（Easy 4、Medium 16、Hard 12，和Problem Breakdowns的32篇题解一一对应），AI Coding 13道（Easy 3、Medium 6、Hard 4，Structured和Open-Ended是同一批题）。每道题有`slug`（题解网址的最后一段）、`title`、`diff`；System Design的`guided`表示题解总览页上有这道题单独的练习页`/practice/system-design/new/<slug>`，没有的“练习”链到题库首页；`uses`是这道题用到的讲义（AI Coding是题解页上标的Pattern；System Design是题目标题下标的Pattern和正文链接到的学习页，题解付费部分里的链接看不到，没算）
- 讲义 - `learn`是33篇学习页（`id`、`title`、`group`、`url`），2026-11-16从网站侧栏读取；排在哪天在`hello-interview.json`的`learn`
- 勾选 - 每道题一个勾，键是`hi-sd.<slug>`和`hi-ai.<slug>`，和时间表的勾一样存在`study-progress.json`（`server.cjs`的`KEY`接受这两种键），label最后是打勾那天的日期（`System Design · Bitly · 2026-11-16`），表里显示成11/16。这个勾和时间表13:45那一格是分开的
- 计划日 - 从`hello-interview.json`算：一天的链接里有这道题的题解，又有练习题链接，就算计划在这天做（实线的D标签，算“已安排”）；只有题解链接的是参考（虚线）。D标签在时间表那天13:45勾过后变绿。说明里列出的自选日是只有练习题链接的那几天，自拟场景是没有练习题链接的那几天
- `hello-interview.json`里链到不在题单里的题解会报错（防止slug写错）。网站加了新题，就把它加进json再运行`node study-tools/build.cjs`

一天的时间（08:30–18:00，9小时，13:15–13:45午饭）：各行仍按原计划的时间生成，`build.cjs`最后的`SLOTS`和`retime`把它们排成现在的顺序并换上现在的时间和时长（项目1小时、复盘15分钟）。General & AI System Design讲义仍然生成，只是不排进时间表

## 双语讲义维护

`bilingual-lessons.cjs`在生成末尾为252页加入Question（只有英文）、Key Terms、英文Short Answer和中文回答。Key Terms每行一个“英文术语：中文解释”；合并的主题（例如Data Leakage; Scaling; scikit-learn Pipelines）每个部分各占一行，链接到它自己的页面。“直观例子”只留在有具体例子的Train / Validation / Test Split页，通用的例子和“练习方式”已删掉。ML主题的完整讲义写在`ml-notes.md`（每个`## `一个主题，`zh:`中文名，`en:`英文Short Answer，其余是正文：分类、例子、怎么防、常见错误、代码），由`ml-notes.cjs`放进页面的“讲义”部分（Key Terms和Short Answer之间）；合并主题的每个部分都写了，Short Answer就换成每个部分各一段的英文答法。目前写好的是Data Leakage、Scaling、scikit-learn Pipelines，加新主题只改`ml-notes.md`再运行`node study-tools/build.cjs`。中文内容来自`lesson-zh.txt`、`concept-zh.txt`与`design-zh.txt`；ML独立主题的英文解释在该模块中维护。`ml-primer.cjs`生成零基础入口，并为15个notebook添加导读，不修改实验代码。

System Design主题的完整参考答案在`design-answers.cjs`：每页加上“怎么学这一页”（Day 1和复习日各45分钟怎么分配）和“参考答案”（页面上每个问题，包括澄清问题和追问，都有中文讲解和可以直接说的英文答法，以及一份5分钟英文口述稿），由`bilingual-lessons.cjs`放进页面。目前写好的是Requirements and API Design；没有写答案的主题只有Short Answer和中文回答。

可在仓库根目录运行`node study-tools/bilingual-lessons.cjs`单独更新讲义。全文Markdown为`AI_ENGINEER_BILINGUAL_LESSONS.md`。原有深入材料保留在HTML折叠区；题库、日期与课时保持原值。

题型按仓库interview/questions整理，技术解释参考各页列出的官方资料与公开讲义，问答脚本与练习为原创整理。没有可验证的面试出现频率数据，因此页面使用“核心主题”而不声称“统计最高频”。课程章节未擅自指定，以用户实际网课进度为准。

本次生成的是学习资料与未来项目任务。没有改Risk Copilot代码、部署AWS资源或运行付费LLM/Snowflake实验。

## 日期、刷题排期与文件位置

- `reschedule.cjs` - 在`original-plan.md`和`original-roadmap.md`的快照上应用当前排期：Day 1改为`top150-schedule.json`里的`start`（周一），刷题时段改为08:30–10:30共2小时，并把LeetCode Top Interview 150与计划原题混合排入（Hard在最后）。生成时这一行还叫08:30–10:30，`build.cjs`再用`patterns.block`把它和当天的pattern合成08:30–11:15的Data Structure & Algo。`build.cjs`、`validate.cjs`、`verify-interview-answers.cjs`都经过它读取快照
- `top150-schedule.json` - 排期数据：每天的计划原题、Top 150题、复习题，以及150题的标题、难度和专题。改排期只改这个文件，再运行`node study-tools/build.cjs`
- `layout.cjs` - 学习指南留在仓库根目录，其余报告（`AI_ENGINEER_TRANSITION_PLAN`、`PROJECT_ROADMAP`、`BILINGUAL_LESSONS`、`TOP150_SCHEDULE`）放在`Reports/`。生成脚本仍按“全部在根目录”工作，引入`layout.cjs`后，运行期间文件临时回到根目录，退出时自动放回`Reports/`并修好链接
- 重新生成会清空notebook的运行输出，之后运行`verify_notebooks.py`重新执行
- 学习指南与每日时间表的分工由`build.cjs`生成：总览（日期与工时、项目计划、Topic总览、规则、课程与题库说明）和“每日入口”（每天一个链接，指向时间表当天位置）写进`AI_ENGINEER_DAILY_LEARNING_GUIDE`；`AI_ENGINEER_TRANSITION_PLAN`只放每天的内容，并加上每天的“学习提示”（当天pattern的中文说明、设计读法、项目任务）
- 时间表每天“学习记录 · 今日学习笔记”链接下面的“今天学习 Topic”也由`build.cjs`生成（`dayTopics`）：从当天的行里取Data Structure & Algo（当天的pattern，链接到pattern页面，`patterns.topic`）、SQL日的SQL主题（`top150-schedule.json`的`topic`）、Hello Interview（13:45，`hi.topic`）和项目任务（15:45，链接到项目路线）；Markdown里是一个列表（用`<!-- day-topics -->`标记），HTML里排成左右两列。改了当天的行，重新生成就会跟着变
- `top150-record.cjs` - “刷题记录”`Reports/AI_ENGINEER_TOP150_RECORD.html`（所有页面顶部导航里“项目路线”后面），上面五个选项卡LeetCode、Pattern、Hello Interview、System Design和AI Coding（记住上次选的，也可以用`#leetcode`、`#pattern`、`#hellointerview`、`#systemdesign`、`#aicoding`直接打开；System Design和AI Coding见上面的“Hello Interview排期维护”）。LeetCode是Top 150，按LeetCode的23个专题分列；每列按日期排序，列像砖墙一样往下排，短的列不留空白。每道题的键从时间表Markdown里08:30行它的勾选框算出（当天和复习日都算），任意一个勾过就算做了，显示为绿色带✓。Pattern选项卡由`patterns.cjs`生成：最上面是repo最值得看的4个链接，下面一张表按学习顺序分四个阶段，每行是pattern（冻结在最左边，前面的勾和时间表当天Data Structure & Algo那一格的读讲义是同一个键，打勾通过`/api/progress`保存）、LeetCode题（在时间表里勾过的变绿带✓，同一格里的早上的题和练习题都算；没做的后面标着计划在哪天，比如D05；🔒是会员题）、中文说明、Recognize it when、Typical cost、备注。pattern名字后面的(D04)是哪天学，链接到时间表那一天。备注和学习记录里这个pattern的框是同一段：键就是那个勾的键，连着服务器时通过`/api/notes`存进`Study notes/drafts.json`（还没确认的先存在浏览器里），网页版读推送上去的`drafts.json`，改的只存在这台设备的浏览器里。名字下面的“</> code template”按钮在当前页面打开一个代码框，写这个pattern的代码模板（Tab缩进4格、Shift+Tab减少缩进、回车保持缩进），自动保存：连着服务器时通过`/api/templates`存进`Study notes/pattern-templates.json`（一个pattern一行，键是pattern页面的文件名，比如`hash-maps`），网页版读推送上去的这个文件；写过的按钮带✓。拖表头右边的竖线改列宽，改过的列存在这个浏览器里（`study-pattern-cols`，按列名），双击还原；表格比页面宽时在框里左右滑。生成时写入当时的进度，打开页面后从`/api/progress`读最新勾选（切回页面会再读一次），没连服务器时用生成时的进度加这个浏览器里的勾选。如果某道题在时间表里找不到勾选框，生成会报错。Hello Interview选项卡用同样的列和计数，每周一列，那天的☐勾过就算完成
- `videos.cjs` - “视频链接”`Reports/AI_ENGINEER_VIDEOS.html`（顶部导航“刷题记录”后面）：在框里粘贴视频链接（小红书可以连分享文字一起粘贴），点Save，本地服务器读出标题和作者，存进`Study notes/videos.json`，表格列是看过、主题、时长、作者、Usefulness、链接，可以搜索、编辑、删除和重新读取。时长（视频长度，存成`seconds`）在保存时和标题一起读：YouTube用播放器接口的`lengthSeconds`，Vimeo用oEmbed，小红书用笔记里的`video.capa.duration`，B站用页面里的`videoData.duration`，其他网站用`video:duration`或`itemprop="duration"`标签；读不到就空着，点“编辑”里的“重新读取”会再试一次。看过的勾选框和Usefulness的1–5星（再点一次当前的星清除）点了就存进`videos.json`的`watched`（勾上的时间）和`rating`，跟着同步按钮推送；两台设备改了同一个视频的不同字段（一边勾看过，一边改标题）合并时都保留。拖动表头每列右边的竖线可以调整列宽，宽度存在这个浏览器里，双击竖线恢复默认。YouTube和Vimeo用官方oEmbed，小红书用iPhone浏览器打开笔记页读`title`和`user.nickName`，B站读视频页（它的API会拒绝脚本），其他网站读oEmbed链接或页面的标题和作者标签；读不到也会存下，再用“编辑”手动填。同一个视频（YouTube视频ID、小红书笔记ID等相同）不会存两次。网页版和没有服务器时只能看：直接读推送上去的`videos.json`。YouTube视频可以点“生成总结”：服务器读视频的字幕（有原字幕用原字幕，否则用自动字幕），合成大约20秒一行的`[mm:ss]`文字，交给`claude -p`（不给任何工具、`--strict-mcp-config`、自己的system prompt、在临时文件夹运行，所以不读CLAUDE.md），用这台电脑上Claude Code的登录，算在套餐用量里，不用API credit。页面上可以选Sonnet、Opus或Haiku。总结（一句话总结、带时间的要点、关键概念）存成`Study notes/video-summaries/<id>.md`，开头记着字幕语言、时长、模型和用了多少tokens；完整字幕不保存。点时间会跳到视频的那一秒。13分钟的视频用Sonnet大约输入4–6k、输出1–1.5k tokens，15–20秒。小红书等其他网站没有字幕，不支持总结。点作者名字（后面有✎）在这一行下面展开对这个作者的备注，再点一次或点“取消”收起，不点不展开；写完点“保存”（或Ctrl+Enter）存进`Study notes/authors.json`（每行一个作者，`note`和`updated`），清空后保存就删除。一个作者只有一条备注，他的每一行都共用；有备注的作者✎是主题色，鼠标停在名字上会显示备注。没保存的文字在收起后也留着，直到保存、取消或刷新页面。网页版只能看已有的备注
- `thoughts.cjs` - “随想笔记”`Reports/AI_ENGINEER_THOUGHTS.html`（顶部导航“视频链接”后面）：File name框输入新名字，或从下拉里选已有的笔记（大小写不同算同一篇），下面的框写随想，点Update（或Ctrl+Enter），本地服务器新建`Study notes/thoughts/<名字>.md`，或者把这条加到那篇的最后，每条上面是`## 日期 时间`。左边列出全部笔记（最近更新的在上面，显示条数和最新一条的开头），点一下在下面显示全文（最新的在上面，链接可以点），也可以删除整篇。框里可以Ctrl+V粘贴截图或者把图片拖进来：图片存成`Study notes/thoughts/images/<内容的哈希>.<png|jpg|gif|webp>`（同一张图只存一份；超过1 MB的先缩到最宽1800像素，取原图、PNG、WebP里最小的；最多10 MB），框里在光标处加一行`![图片](images/...)`，框下面显示缩略图（点×去掉），点Update和文字一起存进笔记；看笔记时显示成图片，在GitHub上看`.md`也一样。删除整篇时，只有这篇用到的图片一起删掉。名字就是文件名，不能有`\ / : * ? " < > | [ ] # %`，最多60个字。框里没保存的内容存在这个浏览器里，关掉页面不会丢。追加时按原文接在文件最后，所以在`.md`里手改过的内容不会被改动；要删某一条就直接改`.md`。`Study notes/thoughts/index.json`是给网页版用的笔记列表（网页版不能列文件夹），每次改动和每次点同步按钮前都从`.md`重新生成，所以手动改名、删除的笔记也会跟上。网页版和没有服务器时只能看
- 时间表HTML的两处交互也由`build.cjs`生成，只在HTML里，Markdown不变：每天的“当天 Interview Questions”默认折叠（标题后显示题数，打开`#answer-Qxxx`链接时会自动展开）；页面顶部固定栏（每个页面的导航都固定在顶部，往下滚动也一直显示；时间表的同步栏和学习记录的日期栏排在导航下面，`--bar-h`是固定部分的高度）的“📅 Daily plan”按钮展开全部日期（今天高亮），点日期跳到当天，点别处或按Esc收起。`verify-interview-answers.cjs`会先展开折叠再检查答案
- 网页版（手机、iPad）：`https://lazy-sleepysheep.github.io/ai-engineering-study-plan/`，GitHub Pages从`main`分支的根目录发布，每次推送后一两分钟自动更新。根目录的`index.html`跳到每日时间表，`.nojekyll`让GitHub原样发布文件（不经过Jekyll）。网页版只能看：勾选只存在那台设备的浏览器里，页面上会写“网页版只能看”，时间表不显示两个GitHub按钮；“今日申请工作”和学习笔记需要本地服务器，不显示；视频链接和随想笔记只能看，不能添加
- `server.cjs` - 本地服务器（`start-server.bat`启动，默认`http://127.0.0.1:5510`，只监听本机）：提供页面，保存时间表里的勾选和课程名，并提供“从GitHub拉取”和“推送到GitHub”两个按钮。不要用5500，那是VS Code的Live Server，不能保存
- `progress.cjs` - 进度的读写和Markdown镜像：`study-progress.json`是进度的唯一来源（每行一项、按键排序、没有时间戳，两台设备改不同项时能干净合并），时间表Markdown里的☐/☑和`Online Course [____]`由它按进度改写。`build.cjs`重新生成时也会按`study-progress.json`写回，所以重新生成不会丢进度
- `notes.cjs` - 学习笔记的两个页面（`#day-NN`选日期），时间表每天标题下都有链接：
  - “学习记录”`Reports/AI_ENGINEER_STUDY_LOG.html`：由`build.cjs`从时间表Markdown生成，每天每一项一个框（题目、Study topic、LeetCode Pattern和练习题、网课、Hello Interview（提示写“卡在哪里、AI帮了什么”）、项目、每道面试题、复盘），键和勾选框相同，所以勾过的项显示✓。输入通过`/api/notes`存进`Study notes/drafts.json`，“生成今日学习笔记”通过`/api/notes/generate`写`Study notes/<日期> Day NN.md`（只写有内容的框，再生成会覆盖同一个文件）
  - “今日学习笔记”`Reports/AI_ENGINEER_STUDY_NOTES.html`：读取当天生成的`.md`并显示（页面里自带一个小的Markdown渲染器，需要服务器）
  - `drafts.json`和生成的`.md`都跟着同步按钮一起推送和拉取（见下面的“两个按钮”）
- 勾选框的键是“当天锚点 + 这一项文字的哈希”：改了某一项的文字（比如换了题），它的旧勾选就不再对应
- 两个按钮只处理`study-progress.json`、时间表Markdown，以及`Study notes/`里的`drafts.json`、`videos.json`、`authors.json`、生成的`<日期> Day NN.md`、`video-summaries/<id>.md`、`pattern-templates.json`和`thoughts/`里的随想笔记和`thoughts/images/`里粘贴的图片（不含README）：拉取是提交本地进度和笔记后`git pull --rebase`，推送是在此基础上再`git push`。只有这些文件冲突时才自动合并：进度、`drafts.json`、`videos.json`和`authors.json`以共同祖先为基准逐项三方合并（两台设备各加的视频都保留）（一台设备取消的勾或清空的框不会被另一台复活，两台都改了同一项时以当前设备为准）；同一篇随想笔记两台设备都加了内容时，两边加的每一条都保留，按时间排，然后重新生成`index.json`；粘贴的图片按内容命名，两边一样，直接保留；Pattern代码模板逐个pattern合并，同一个两台都改了以当前设备为准；同一天的笔记`.md`在两台设备都生成过时保留当前设备的版本，草稿已经合并，在学习记录里再生成一次就能得到两边的内容。其他文件冲突会中止并提示，不会替你决定
- 时间表08:30那一行（Data Structure & Algo）由`build.cjs`调用`patterns.block(day, line)`写出，原来13:30的那一行（后来的10:30 LeetCode Pattern）不再生成，见上面的“LeetCode Pattern排期维护”。学习记录里这一格开头多一个“这一格整体”的框（键是`day-NN.dsa`），原来Study topic框里写的笔记搬到了这里。ML讲义和notebook仍然生成（Topic Library里能找到），只是不再排进时间表，页面上写着“不排进时间表，需要时自学”；指南里的“题库一览”表也由`build.cjs`生成
- `applications.cjs` - 读取career-ops仓库（私有）里的`reports/tracker/pass-tracker.md`的Applied表、`applied.json`的申请日期、`jd/`里的本地JD页面（文件名是岗位链接sha256的前16位）和`data/applications.md`里的完整评估分数（按Full Eval的编号对应；tracker的Score列是初筛分，不用它），按日期分组。时间表的表格列是岗位名称、公司、Eval分数、Eval报告、Local JD和岗位链接；服务器通过`/api/applications`提供，评估报告HTML通过`/career-ops/reports/`提供（只开放reports下的.html，仅本机）。career-ops默认找本仓库旁边的`career-ops`文件夹，也可以用环境变量`CAREER_OPS_DIR`指定。时间表每天只放一个空的“今日申请工作”位置，页面打开时由脚本填充，申请信息不会写进Markdown、HTML或GitHub（本仓库是公开的）
