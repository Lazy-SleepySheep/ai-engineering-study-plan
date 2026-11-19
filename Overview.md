# Overview

这个仓库由几套东西叠在一起:

- 原版 AI Engineering Field Guide - 岗位、面试、学习路线、作品集资料,基于 6,964 条真实 JD
- 每日学习计划 - 252 页中英双语讲义、题库、41 个 LeetCode pattern 的学习排期
- ML notebooks - 15 个本地可运行的实验(不排进时间表,需要时自学)
- 职位数据流水线 - 每月抓取并用 LLM 结构化新数据
- `wiki/` - 由 LLM 维护的知识库

所有命令默认在仓库根目录运行,特别说明的除外。

## 想做什么,运行什么

- 浏览 wiki - `python serve_wiki.py`,然后打开 http://127.0.0.1:8000
- 打开学习计划页面(勾选能保存) - 双击 `start-server.bat`,或者在 VS Code 里打开这个文件夹让它自动启动,然后打开 http://127.0.0.1:5510/Reports/AI_ENGINEER_TRANSITION_PLAN.html
- 用 Chrome 书签直接打开时间表(重启电脑后也能用,不开机自启) - 每台电脑先双击一次 `open-study-plan.bat`,然后把书签网址设成 `studyplan://plan`(另有 `studyplan://guide`、`studyplan://leetcode`)。点书签时 Chrome 会问是否打开,点"打开";服务器没在运行就自动在后台启动,再打开页面。移动仓库位置后再双击一次;`open-study-plan.bat remove` 取消
- 写每天的学习笔记 - 时间表里每天标题下有两个链接:"✎ 学习记录"是写的地方,每一项下面的框里写,自动保存,点"生成今日学习笔记"写进 `Study notes/` 里当天的 `.md`;"📖 今日学习笔记"显示生成好的笔记。见 [Study notes/README.md](Study%20notes/README.md)
- 随手记临时想法 - 任意页面顶部导航点"随想笔记",File name 填新名字或选已有的笔记,写完点 Update,新建一篇或者加到那篇的最后,存在 `Study notes/thoughts/`;框里可以 Ctrl+V 粘贴截图,或者把图片拖进来
- 把进度和学习笔记同步到另一台设备 - 这台点"推送到 GitHub";另一台设备运行 `start-server.bat`,打开页面点"从 GitHub 拉取"。建议开始学习时先点一次"从 GitHub 拉取",结束时点一次"推送到 GitHub"
- 每日学习 - 直接打开 `AI_ENGINEER_DAILY_LEARNING_GUIDE.html`,不需要命令
- 记录碎片时间看到的面试题 - 在 `micro-learning/questions.md` 里加一行 `- [ ] 题目`,答案每天自动生成到 `micro-learning/answers/`
- 跑 ML 实验 - 先建环境(见下),再在 VS Code 打开 `notebook/*.ipynb`
- 抓取新一个月的职位数据 - 在 Claude Code 里运行 `/fetch-jobs`
- 改了学习资料后重新生成 - `node study-tools/build.cjs`
- 检查学习资料有没有坏 - `node study-tools/validate.cjs`
- 验证 notebook 能跑通 - `.\.study-venv\Scripts\python.exe study-tools/verify_notebooks.py`

## 按用途找入口

1. 了解岗位和技能 - 读 [README.md](README.md),再看 `role/`(技能、职责、用例、趋势)
2. 准备面试 - 读 `interview/`(流程、分类题库、51 家公司的面试数据、拿 offer 之后的内容)
3. 规划转岗 - `learning-paths/` 有从 Data Engineer、Data Scientist、ML Engineer、Backend、Frontend 出发的路线
4. 做作品集 - 读 `portfolio/`
5. 每天学习 - `AI_ENGINEER_DAILY_LEARNING_GUIDE.html` 按日程学,`Study topics/` 是各知识点的 HTML 讲义
6. 积累面试题 - `micro-learning/` 是面试题收件箱和每日答案
7. 查资料和问答 - 用 `wiki/`

目录全貌见 [REPO_STRUCTURE.md](REPO_STRUCTURE.md)。

## 学习计划文件

这些文件是同一套学习计划的不同视图。计划从 2026-11-09(周一)开始,Day 1 就是这一天:8 周主计划到 2027-01-01(Day 40),再加 1 周缓冲到 2027-01-08(Day 45)。工作日每天 9 小时(08:30–18:00,13:15–13:45 午饭),周末休息;感恩节、圣诞节和元旦都按工作日算,要休息就把当天内容顺延。它们都是 `study-tools/` 生成的,每份有 `.md` 和 `.html` 两个版本,除了 BILINGUAL_LESSONS 和 TOP150_SCHEDULE 只有 `.md`。

当前位置:`AI_ENGINEER_DAILY_LEARNING_GUIDE` 在仓库根目录,另外几份在 `Reports/`。

先分清最常用的两份:学习指南是总览入口,每日时间表是每天要做的事。

- `AI_ENGINEER_DAILY_LEARNING_GUIDE` - 学习指南,总览和入口,只有 6 节:每日入口(按周分组,每周一行,点开日期跳到每日时间表里当天的位置)、题库一览(一张表,每个题库一行:LeetCode、SQL、LeetCode Pattern、面试原题等各有多少)、使用方法、项目、Topic 总览、计划说明。想知道今天做什么,先开这份找到当天,点进去
- `AI_ENGINEER_TRANSITION_PLAN` - 每日时间表,纯每日内容(约 19,500 行,是最大的一份)。每一天是一张 6 行的表(没有午休行):08:30 Data Structure & Algo、11:15 Online Course、13:45 Hello Interview、15:45 项目、16:45 面试题、17:45 复盘。08:30–11:15 的 Data Structure & Algo(2 小时 45 分钟)把刷题和 LeetCode pattern 放在一格里,分两栏,左栏是每一组的标题,右栏是这一组的题:最上面是当天 pattern 的页面链接和时间,比如"#29 Prefix Sum(65mins):"(读讲义 15 分钟、两道练习题 30 分钟,加上早上排的同 pattern 的题),右边是这个 pattern 的题(原来的两道识别练习题和早上排的同 pattern 的题,从易到难);SQL 日接着是"SQL 60 mins:";然后"其他题 N mins:"是不属于今天 pattern 的题,最后"复习 N mins:"。每道题一行,都带勾选框。原来早上第一行的 Study topic 和"资料:"链接已经去掉。Day 01–03 没有 pattern,只有"刷题";偏门的 pattern 两个一天,Top K 和 K-way Merge 一天;Day 42–45 是不标 pattern 的混合识别题。从 Day 06 起 pattern 的顺序跟着早上的题走,每道 Top 150 题排在它所属 pattern 的那天或之后(比如 Day 06 学 Merge Intervals,相关题是 4 道 intervals 和 2 道练习题);Day 31 以后学的是题库里没有对应题的 pattern,那几天的题大多在"其他题"里,是前面学过的 pattern 的剩余题和 Hard 题。13:45 那一行是 Hello Interview(System Design 和 AI Coding,2 小时):也分两栏:左栏"Material"的右边是当天要先读的 Hello Interview 讲义,每篇一行、一个勾选框,写成"Handling Large Blobs (20mins)(本地连接 · Summary)"(System Design 的 Core Concepts、Patterns、Key Technologies 和 AI Coding 的 Common Patterns 共 33 篇,每篇读一次,排在第一道用到它的题那天或之前;标题链到网站,本地连接打开 `resource/` 里下载的网页,Summary 打开从 Obsidian 库 JuJu_Workspace 的笔记生成的 HTML 页面(`resource/Summary/`));左栏"Review"的右边是今天的题也用到、之前已经读过的讲义,后面写着哪天读的;然后是当天的题目(加粗,一个勾选框,后面写着读完讲义剩下的时间,比如"System Design:Design Dropbox (80mins)")和任务,最后一行在"［ ］"里放"讲义:"、"题解:"、"练习题:"的链接(没有的那类不写,题解也有本地连接);Hello Interview 题库里的 System Design 32 道和 AI Coding 13 道全部排在 Day 04–45,每道一次;System Design 基本一天一道,有 6 天是两道考点相近的题一天(各 1 小时);Day 04 是答题框架,Day 35 是 AI Coding 流程查漏,Day 42 重做最弱的 Coding;Day 01–03 原来是 General & AI System Design。表格下面是"今日申请工作"(当天申请的岗位数量,下面是岗位名称、公司、Eval 链接和 Local JD 链接,数据由本地服务器实时读自你的 career-ops 仓库,不会写进这个仓库)、学习提示、当天 20 道左右面试原题,每题附英文 Interview Answer、Explanation 和 Follow-up。HTML 版先展开口述稿,再按需展开详解和参考代码
  - 勾选框 - 每道刷题、pattern、练习题、设计、项目、面试题、复盘后面都有一个勾选框,做完点一下。网课那一行有输入框,可以写课程名
  - 进度保存 - 在本地服务器上打开页面时,勾选会写进 `study-progress.json`(进度的唯一来源),同时把时间表 Markdown 里对应的 ☐ 改成 ☑。页面顶部有两个按钮,点了才会动 GitHub,打勾本身不会:"从 GitHub 拉取"只拉取别的设备的进度,不推送;"推送到 GitHub"先拉取再推送。两个按钮只处理 `study-progress.json`、时间表 Markdown 和 `Study notes/` 里的笔记(`drafts.json`、生成的 `.md`、视频和随想笔记)。只有 HTML 版有勾选框,方向是 HTML 到 Markdown,直接改 Markdown 里的 ☐ 不会反过来更新进度
  - 一定要用 `http://127.0.0.1:5510/...` 打开,不要用 5500:5500 是 VS Code 的 Live Server,只能显示页面,不能保存。没连上服务器时,勾选只存在这个浏览器里
- `AI_ENGINEER_PROJECT_ROADMAP` - 三项目实践路线,每天 15:45-16:45 的项目时段(1 小时):Day 01-20 Risk Copilot(20 小时),Day 21-30 Financial Statement Analytics Assistant(10 小时),Day 31-38 Investment Research Workbench(8 小时),Day 39-40 复现与收尾。每天的任务和原来一样,做不完的放到缓冲周。这是未来的计划,不是项目已完成的报告
- `AI_ENGINEER_TOP150_SCHEDULE` - LeetCode Top Interview 150 的完整排期(`Reports/` 里,只有 `.md`)。列出 150 题分在哪一天、每个专题的进度,以及计划里不在 Top 150 的 21 道题。详见下面的"刷题安排"
- `AI_ENGINEER_TOP150_RECORD` - 刷题记录(`Reports/` 里,只有 `.html`,每个页面顶部导航"项目路线"后面都有链接)。上面有 LeetCode、Pattern、System Design 和 AI Coding 四个选项卡(`#pattern`、`#systemdesign`、`#aicoding` 直接打开),每个选项卡顶部的进度条后面写着百分比。System Design 和 AI Coding 就是时间表 13:45 的 Hello Interview(原来单独的 Hello Interview 选项卡已经并进这两个):最上面是讲义 tracker(System Design 26 篇、AI Coding 7 篇,每篇后面是本地连接、Summary、Video(后面是视频时长)和哪天读),下面是题目,按周排,顺序和时间表一样(System Design 32 道加 Day 04 答题框架,AI Coding 13 道加 Day 35 流程查漏和 Day 42 重做最弱的 Coding),每行后面是难度、D 标签、Video(带时长)和"练习"。Video 在电脑的本地服务器上播本地文件,在手机上(GitHub Pages)打开 YouTube 或自己 Google Drive 里的视频。讲义和题目的勾都和时间表 13:45 那一格是同一个勾,在哪边勾都行;一天两道题的两道共用一个勾。LeetCode 是 Top Interview 150,按 LeetCode 的 23 个专题分列,显示已刷多少、还剩多少,在时间表里勾过一次(当天、复习日或重复排的那天)的题变绿色带 ✓。Pattern 是 [grokking-coding-interview](https://github.com/design-gurus/grokking-coding-interview) 的 41 个 pattern,按学习顺序分四个阶段列成一张表:最上面是这个 repo 最值得看的 4 个链接,每行是 pattern(冻结在最左边,前面有勾)、对应的 LeetCode 题、中文说明、Recognize it when、Typical cost 和备注(名字后面的 (D04) 是哪天学;备注和学习记录里这个 pattern 的框是同一段,写在哪边都行;名字下面的 </> code template 点开是一个代码框,写这个 pattern 的代码模板,存在 `Study notes/pattern-templates.json`);列宽可以拖,表格可以左右滑。这里的勾和时间表当天 Data Structure & Algo 那一格的 pattern 是同一个勾。连着本地服务器时读最新的勾选,切回页面会自动刷新
- `AI_ENGINEER_VIDEOS` - 视频链接(`Reports/` 里,只有 `.html`,顶部导航"刷题记录"后面)。粘贴 YouTube、小红书、B站等视频链接点 Save,自动读出标题、作者和时长,存进 `Study notes/videos.json`,跟着"推送到 GitHub"同步;YouTube 视频可以生成带时间的中文总结(用这台电脑上 Claude Code 的登录,存在 `Study notes/video-summaries/`);点作者名字在那一行下面展开对这个作者的备注,写完保存(存在 `Study notes/authors.json`),不点不展开,有备注的作者 ✎ 是主题色;网页版只能看
- `AI_ENGINEER_THOUGHTS` - 随想笔记(`Reports/` 里,只有 `.html`,顶部导航"视频链接"后面)。File name 输入新名字或从下拉里选已有的笔记,下面的框写临时想法,点 Update(或 Ctrl+Enter)就新建 `Study notes/thoughts/<名字>.md`,或者加到那篇的最后,每条带日期时间。左边列出全部笔记,点一下看全文。框里可以 Ctrl+V 粘贴截图或拖进图片,存在 `Study notes/thoughts/images/`,笔记里显示成图片。跟着"推送到 GitHub"同步;网页版只能看
- `AI_ENGINEER_BILINGUAL_LESSONS` - 全部讲义的 Markdown 合集(约 8,600 行)。每个主题按 背景、Question、Key Terms、直观例子、英文 Short Answer、中文回答 的顺序写。适合通读或复习,不用一页页点 HTML

每天的时间块是固定的:

1. 08:30-11:15 - Data Structure & Algo(2 小时 45 分钟:先读当天的 pattern,再做这个 pattern 的题,然后是其他题、SQL 和复习)
3. 11:15-13:15 - 网课(2 小时)
4. 13:15-13:45 - 午饭
5. 13:45-15:45 - Hello Interview(System Design 和 AI Coding,2 小时;当天有讲义就先读讲义再做题)
6. 15:45-16:45 - Project(1 小时)
7. 16:45-17:45 - 面试原题
8. 17:45-18:00 - 复盘(15 分钟)

## 刷题安排

刷题在每天 08:30-11:15 的 Data Structure & Algo 里:前 45 分钟是当天的 pattern(读讲义 15 分钟加两道练习题),其余 2 小时是下面这些题,当天 pattern 的题排在最前面。

- Python 日(周一、周三、周五) - 计划原有的 Python 题和 Top 150 混合刷,每天 4 到 7 题
- SQL 日(周二、周四) - 前 1 小时做 SQL(三题候选先做前两题),后 1 小时刷 Top 150,每天 2 到 3 题
- Hard - 全部排在 Day 35(2026-12-25)之后,Day 41(2027-01-04)做完
- Day 42 到 Day 45 - 重做薄弱题,不再新增题目
- 估算 - Easy 15 分钟、Medium 20 分钟、Hard 30 分钟,工程实现题(KV Store、Rate Limiter、Crawler)30 分钟。实际速度比估算慢,就把没做完的题顺延到 Day 42 到 Day 45

每天的具体题目和链接在 `Reports/AI_ENGINEER_TRANSITION_PLAN.html` 当天的第一行,完整题单见 `Reports/AI_ENGINEER_TOP150_SCHEDULE.md`。

## 最近更新

按时间从新到旧,只列对使用有影响的:

- 2026-11-04 - 学习计划整体改期:Day 1 从 2026-10-05 改为 2026-11-09;刷题时段延长为 2 小时,并把 LeetCode Top Interview 150 全部排进去(Hard 放最后),新增 `Reports/AI_ENGINEER_TOP150_SCHEDULE.md`
- 2026-10-07 - 加了 `/fetch-jobs` 命令(`.claude/commands/fetch-jobs.md`,同时有 `.agents/skills/source-command-fetch-jobs/`),一条命令跑完整个抓取流程
- 2026-10-05 - 加了 `micro-learning/`:`questions.md` 是待答题池,首批记录了 58 道小红书 Agent 开发面经题;`answers/2026-10-05.md` 是每日生成的英文回答加中文要点,已答的题会被打勾。答案由定时任务生成,不是手动写的
- 2026-10-04 - 加了整套学习材料:5 份计划文件、`Study topics/`(252 页讲义)、`notebook/`(15 个 ML 实验)、`study-tools/`(生成和校验脚本)
- 2026-09-23 - 加了 9 月的 Built In 抓取数据(`job-market/data_structured/2026-09-23/`),这是目前最新的一批
- 2026-09-19 - `CLAUDE.md` 改名为 `AGENTS.md`,Claude 读的是 `AGENTS.md`;`wiki/` 里同理
- 2026-09-16 - 市场统计 wiki 搬到了 AI-Shipping-Labs/wiki 仓库
- 2026-09-10 - 加了 `serve_wiki.py`,可以在本地用浏览器看 wiki
- 2026-09-09 - 加了 `wiki/`(覆盖仓库全部原创内容),爬虫代理从 Oxylabs 换成 DataImpulse

新增而且能直接用的文件:

- `AI_ENGINEER_DAILY_LEARNING_GUIDE.html` - 每天学习的入口
- `Study topics/index.html` - 可搜索的 Topic Library,按主题查讲义和首次学习日、复习日
- `notebook/01_train_validation_test_split.ipynb` - 15 个 ML 实验的第一个
- `micro-learning/questions.md` 和 `micro-learning/answers/` - 面试题收件箱和答案
- `study-tools/answers/` - 面试原题的英文回答源文件(`01-foundations.txt` 到 `05-experience.txt`)
- `serve_wiki.py` - 本地浏览 wiki
- `/fetch-jobs` - 一键更新职位数据

## ML notebook

用 Python 3.12 在仓库根目录建环境,只需做一次:

```powershell
py -3.12 -m venv .study-venv
.\.study-venv\Scripts\python.exe -m pip install --no-cache-dir -r notebook/requirements-lock.txt
```

然后在 VS Code 里装 Python 和 Jupyter 扩展,打开 `.ipynb`,右上角 Select Kernel 选 `.study-venv\Scripts\python.exe`。从 `notebook/01_train_validation_test_split.ipynb` 开始。

这些实验用合成数据,不需要 API key。详见 [notebook/README.md](notebook/README.md)。

## wiki

- 浏览 - 运行 `python serve_wiki.py`,用 `--port` 换端口,页面后加 `?raw=1` 看 markdown 源码
- Ingest - 把资料放进 `wiki/raw/`(或直接给 Claude 一个 URL),让它整理成摘要、更新相关页面并写入 `wiki/log.md`
- Query - 直接向 Claude 提问,有复用价值的回答会存进 `wiki/answers/`
- Lint - 定期让 Claude 检查矛盾、过期说法、孤立页面和缺失页面

规则见 [wiki/README.md](wiki/README.md),wiki 自己的主题总结见 [wiki/overview.md](wiki/overview.md)。

## 更新职位数据

职位数据会更新,每月抓一次。最近一次抓取在 `job-market/data_structured/2026-09-23/`。

最简单的方式是在 Claude Code 里运行:

```
/fetch-jobs
```

它定义在 `.claude/commands/fetch-jobs.md`,按顺序跑下面 5 步,每步报告数量,出错就停下。

手动运行的话,先进入工作目录,再依次执行(`{YYYYMMDD}` 换成第 1 步输出的日期):

```powershell
cd job-market/_internal
uv run python scrapers/scrape_builtin_requests.py
uv run python scrapers/clean_dedup.py all_jobs_{YYYYMMDD}.csv
uv run python scrapers/download_all_html.py --csv all_jobs_{YYYYMMDD}_dedup.csv
uv run python scrapers/extract_from_html.py --all --csv all_jobs_{YYYYMMDD}_dedup.csv
uv run python extract_llm.py --all --csv all_jobs_{YYYYMMDD}_dedup.csv
```

每一步做什么:

1. 抓取 builtin.com 的列表页(LA、NY、London、Amsterdam、Berlin、India)
2. 去重,并合并进全局的 `data/all_jobs_dedup.csv`
3. 下载每个职位的 HTML
4. 从 HTML 直接解析成 `data_raw/{日期}/*.yaml`,不用 LLM
5. 调用 LLM 做分类和提取,输出 `data_structured/{日期}/*.yaml`

运行前需要:

- Python 3.13 以上和 `uv`(依赖在 `job-market/pyproject.toml`)
- 代理账号 - 第 1、3 步通过 DataImpulse 代理(备用 Oxylabs),需要 `DATAIMPULSE_USER`、`DATAIMPULSE_PASSWORD` 等环境变量
- LLM key - 第 5 步用 Z.ai 的 GLM 模型,需要 `ZAI_API_KEY`,模型默认 `glm-5.2`,可用 `ZAI_MODEL` 覆盖
- 环境变量可以直接导出,也可以写进项目的 `.env`,详见 `job-market/_internal/PIPELINE.md`

跑完之后:

- 市场统计 wiki 已搬到 [AI-Shipping-Labs/wiki](https://github.com/AI-Shipping-Labs/wiki),在那个仓库运行 `uv run python market-wiki/generate.py` 重新生成
- `role/` 里的统计数字和 `README.md` 里的总数不会自动更新,需要重跑 `job-market/analysis.ipynb` 并手动核对
- `is_management` 和 `company_stage` 两个字段目前不可靠,不要引用

## 维护学习资料

"维护"的意思是:学习指南、讲义、题库页面(`AI_ENGINEER_*.md/html`、`Study topics/*.html`、`notebook/*.ipynb`)是生成出来的,不要直接改 HTML。要改内容,就改 `study-tools/` 里的源文件,再重新生成。

内容源:

- `coding.cjs`、`sql.cjs`、`ml.cjs`、`design.cjs`、`concepts.cjs` - 各类题目和知识点
- `lesson-zh.txt`、`concept-zh.txt`、`design-zh.txt` - 讲义的中文内容
- `hello-interview.json`、`hello-interview.cjs` - Hello Interview 每天的题目、任务、链接和每周目标,时间表 13:45 那一行和刷题记录的 Hello Interview 选项卡;改了以后运行 `build.cjs`
- `hello-interview-problems.json`、`hi-problems.cjs` - Hello Interview 题库的全部练习题和 33 篇讲义(System Design 的 Core Concepts、Patterns、Key Technologies,AI Coding 的 Common Patterns,每道题用到哪几篇;2026-11-16 从网站读取),刷题记录的 System Design 和 AI Coding 选项卡;网站加了新题就加进 json 再运行 `build.cjs`
- `patterns.json`、`patterns.cjs` - 41 个 LeetCode pattern(英文说明来自 grokking-coding-interview,中文说明、对应的 LeetCode 题、早上每道题属于哪个 pattern)和每天学哪个;改了排期或题目后运行 `build.cjs`

完整流程:

```powershell
node study-tools/build.cjs
node study-tools/validate.cjs
.\.study-venv\Scripts\python.exe study-tools/verify_notebooks.py
```

三条命令的作用:

1. `build.cjs` - 生成学习指南(MD 和 HTML)、Topic Library 和 notebooks,末尾自动执行双语讲义模块
2. `validate.cjs` - 核对日期、课时、题库数量和本地链接,结果写进 `validation.json`
3. `verify_notebooks.py` - 在独立 kernel 里执行 notebook,结果写进 `notebook-validation.json`

只改一部分时可以单独运行:

- `node study-tools/bilingual-lessons.cjs` - 只更新双语讲义

注意:

- 重新生成时,没改过 cell 的 notebook 会保留运行输出;改过的 notebook 需要再跑一次验证
- 原 623 道题、早上的 LeetCode 链接和 notebook 实验代码保持不变(pattern 的练习题是另加的;Data Structure & Algo 那一格里同一天的题按 pattern 重新排了顺序,题目不变)
- `study-tools/original-plan.md` 和 `study-tools/original-roadmap.md` 是只读快照,不是当前入口
- 日期和刷题安排由生成脚本决定，改了就重新生成：`study-tools/top150-schedule.json` 是排期数据（Day 1 日期、每天的题），`study-tools/reschedule.cjs` 把它应用到 `original-plan.md` 和 `original-roadmap.md` 的快照上。不要手改生成出来的文件，下次重新生成会丢
- 学习指南留在仓库根目录，其余报告放在 `Reports/`。生成脚本仍按"全部在根目录"工作，由 `study-tools/layout.cjs` 在运行期间把文件临时放回根目录，退出时再放回 `Reports/` 并修好链接，所以直接运行 `build.cjs`、`bilingual-lessons.cjs` 都是安全的
- 重新生成会清空 notebook 的运行输出，之后运行 `verify_notebooks.py`
- 详细说明见 [study-tools/README.md](study-tools/README.md)
