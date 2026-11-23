---
name: njgotthis-edit
description: 剪辑 NexJarvis「NexJarvis Got This」IG Reels 系列（编号 NJ26_SM_IG_0xx）的完整流程和风格：在 ChatCut Desktop 里把主持人的口播素材剪成 1080×1920 竖版短片，包括粗剪去口误、降噪和响度、白字加重点字底块的字幕、按 nexjarvis.io 品牌做的 MG 动画（图标排版 / 产品页面加镜头放人物后面 / 流程动画）、NJ bot、缩放关键帧、CC0 音效和 BGM、关注结尾卡。只要用户提到 NexJarvis Got This、NJ26_SM_IG、NexJarvis 的 IG reels / 口播 / 新一集，或要照 014（Meeting Minutes）、012（Email）的风格剪片、改片、加 MG 或字幕，就用这个 skill，即使没有说出 skill 的名字。
---

# NexJarvis Got This 剪辑（njgotthis-edit）

这是 NexJarvis 的 IG Reels 系列：主持人对镜头讲约 40 秒，先讲一个职场痛点，再说「今天我有 NexJarvis」，演示功能，最后「关注 NexJarvis，明天一分钟解决什么」。
已完成两集，都在 ChatCut Desktop 里剪：

- **014 Meeting Minutes**（会议记录）：ChatCut 专案 `2e9e252a-9968-4cde-a528-199e79f65b8e`
- **012 Email**：ChatCut 专案 `978ff576-5518-43fd-9af1-945c3ffeaccc`。**定稿是时间线「Timeline」**（`2c53db50…`），只在小助理和 AI 两处用 NJ bot。同专案里的「含 NJ bot 版」是被否决的满场走位版，只当参考，不要照它做。

### 在别人的电脑上用

这个 skill 也给 NexJarvis 团队的其他人用。规则是这个系列定下的，谁剪都照做；文中的「用户」是指正在剪片、跟你对话的人，引号里的原话来自最初的剪辑者。

- 上面两个 ChatCut 专案 ID、`~/Desktop/NexJarvis/...` 这些文件夹只在原剪辑者的 Mac 上。找不到就不要去找，直接用本 skill 的 `assets/` 和 `references/` 里的数值和文件；新一集的素材在哪里，问使用者。
- ChatCut 记忆里可能没有下面提到的那几条记忆，那就以本 skill 为准。
- 需要装好 ChatCut Desktop；在 Claude Code 里要连上 `chatcut_desktop` MCP。

这个 skill 把两集里用户提过的所有要求、改过的地方和做法整理在一起。用户每次纠正的原话和背景在 `references/episodes.md`；要做到哪一步时按下面的指引去读对应文件。

| 文件 | 什么时候读 |
|---|---|
| `references/style-spec.md` | 开工前必读。品牌、安全框、字幕、MG、动效、缩放、音频、音效、结尾卡的具体数值 |
| `references/chatcut-recipes.md` | 动手操作 ChatCut 时。工具用法、人物抠像放 MG 后面、关键帧曲线、响度测量、验证方法、已知的坑 |
| `references/episodes.md` | 规划新一集的段落和 MG 时。014 和 012 每段对应的 MG、时间点，以及用户每一次纠正 |
| `assets/mg-kit/` | 做 MG 和字幕时。共用组件 `nj-kit.jsx`、字幕模板 `caption-nj.jsx`、两集可复用的 MG 源码 |
| `assets/sfx/`、`assets/music/` | 加音效和 BGM 时。全部 CC0（免署名），出处在各自的 `CREDITS.txt` |
| `assets/ig-reels-safe-frame.png` | 排版检查用的 IG 安全框（用户提供）|
| `assets/nj-bot-cutout.png` | NJ bot 透明底图 |
| `assets/logo/` | NexJarvis 真 logo（brandmark、蓝色和白色主 logo），品牌登场用 brandmark |

在 Claude Code 里，ChatCut Desktop 的工具在 `chatcut_desktop` MCP 服务器上（不是网页版的 `plugin:chatcut:chatcut`）。在 ChatCut 应用里，同名工具直接可用。

## 开工前

1. **找素材。** 每集一个文件夹：`~/Desktop/NexJarvis/Video Edit/NJ26_SM_IG_0xx_NexJarvis_Got_This_<主题>/`，里面有 `footage/`、口播脚本（`.rtf`）、`output/`。`footage/` 可能是空的：素材常在 iPhone 照片图库里，而 shell 读不了照片图库（macOS 隐私限制），这时请用户把片段导出到 `footage/`，不要自己去翻。
2. **读脚本。** 字幕用词、品牌名（NexJarvis，语音识别常写成 Next Jarvis / Next 小）、英文词的写法以脚本为准。脚本和口播对不上、又听不出来时，在交片时点出来问用户。
3. **看记忆。** ChatCut 的 `manage_memory` 里有「IG Reels 安全框」「NexJarvis Got This MG 排版与动效」「NexJarvis 品牌视频规则」「NJ bot 角色素材」；品牌风格存在 Design Style「NexJarvis」（`37d0e17b-b116-4a03-b088-1b0dd8aac66e`）。和本 skill 冲突时，以较新的那条为准，并顺手把另一边更新。
4. **建专案。** 新开 ChatCut Desktop 专案，名字照「NJ26_SM_IG_0xx NexJarvis Got This – <主题>」，1080×1920、25fps（和 iPhone 素材一致），套用 Design Style「NexJarvis」。把 `assets/mg-kit/` 整个拷到新专案的 `workspace/nexjarvis-mg/`（做法见 recipes）。把 `assets/ig-reels-safe-frame.png` 放在最上面一条轨道并关闭（`enabled:false`），只在检查时打开，导出前确认是关的。

## 剪辑流程

照这个顺序做；每一步的具体数值在 `style-spec.md`。

1. **粗剪。** 只留正式那一条口播（014 去掉了粤语试拍、重复的「关注我们」、结尾闲聊）。去掉口误、重说和长停顿。Hook 里的动作要完整（014 用户特别要把开头那个转身加回来）。
2. **开头镜头。** 第一个镜头不要硬切；一条连续片段，用关键帧从 100% 慢推到 120%。
3. **声音。** 背景噪音大就先做 AI 人声隔离（`isolate_voice`），再调响度：人声 normalize −16 LUFS，总线 limiter 输入 +13 dB，调各段口播的 clip gain，直到人声约 −11.9 dBFS RMS、整体约 −9.5 LUFS（和 014、012 一致，用户接受这个偏响的电平）。
4. **字幕。** 用 `caption-nj.jsx` 模板：白字、黑影 60%、无底卡；重点字是品牌靛蓝 #4F46E5、最粗、放在白色小底块上。**每行一行、5–8 个字**（系列规则），拆开会切断词的短句可以少于 5 个字。每一句都手动选重点字，连接词和口头禅（如「那说一下」）不做重点；重点要整词（「上上上次」四个字一起）。
5. **MG。** 每一段先判断内容类型再选排版：并列重点 → 圆形图标加小标签；有规律的步骤 → 全屏产品页面 MG 加虚拟镜头，放在人物后面；过程 → 小流程动画，用户画了草图就照草图。MG 要把产品能力讲对（014「一字不漏」是 NexJarvis 的功能，不是被记录的事项）。提到「小助理」或「AI」的图标默认换成 NJ bot。动效一律三次方缓出，不要回弹。
6. **缩放。** 口播段底图略放大（014 105%、012 112%），跟着重点字推近、说完拉回；递进的词等距递增（014「上次 / 上上次 / 上上上次」一路放到 135%）。所有关键帧都用三次方缓出。同一条素材被跳剪时，后一段首帧和前一段尾帧的位置大小要一样，再慢慢漂到它自己的缩放。
7. **音效。** 用 `assets/sfx/` 的 CC0 音效，放在 MG 入场、图标出现、重点字、点击、成功、错误这些点上。要找新音效只用 Openverse 的 `license=cc0,pdm`（用户不要需署名的）。品牌登场和结尾卡不要放 sparkle（用户手动删过）。
8. **BGM。** 默认「The Lucky Ticket」，−36 dB，从第一个口播镜头开始到结尾，淡入 20 帧、淡出 12 帧。开头若是小剧场 hook，那段不放音乐。
9. **结尾。** 「关注 NexJarvis」按钮 + 「明天 一分钟 解决什么？」在口播最后一句时出现在上方，主持人离开画面后滑到正中放大，停到最后一帧；下面垫品牌深色渐变背景（不是黑底）。
10. **验证。** 用带 outline 的抽帧量每个 MG 的位置、对齐和安全框，看切点前后帧，量声音，渲染一段 clip 看有没有黑帧。做法见 recipes 的「验证」。
11. **交片。** 用中文告诉用户改了什么、在哪里看、哪些自己没法确认（听不到声音、只看了抽帧、自己编的占位文字）。**用户没说就不要导出**；要导出时导到该集的 `output/`，1080×1920、25fps。30fps 版本用户自己做，不在这个 skill 里。

## 跟用户合作

- **用户会在两次请求之间自己在 ChatCut 里手动改**（裁剪、ripple、删音效、改位置）。每一轮开始先重新读整条时间线，不要假设和上次一样。ripple 裁剪后字幕会跟着声音走，MG 不会，要把 MG 对回它对应的那句话。
- **用户手动删掉或改掉的东西不要加回去**，除非用户再要求。
- **MG 必须是一整段。** 一个 MG 被切成两段会从头再播一次；看到被切开的 MG 就合回一段。
- **不确定就给选项。** 例如字幕挡住画面重点时，先列出几种做法（移画面 / 遮罩 / 只改这一段）和代价让用户选。014 试过为了躲字幕把整段画面放大上移，用户要求回到原样，所以不要为了躲字幕去动整段构图。
- **另做版本放另一条时间线**（`manage_timelines` duplicate），用户没说删就留着；交片时讲清楚哪一条是定稿。
- **自己编的文字要说出来**（例如 MG 里的示例邮件内容、「帮你全部记录」这类补充语），并做成 MG 属性让用户能改。
- **用户给出新的系列级要求时**，除了照做，还要更新 ChatCut 记忆，并把这个 skill 的对应段落一起改掉（Claude Code 的 `~/.claude/skills/njgotthis-edit/` 和 ChatCut 账号里的同名 skill 两份都要改）。只针对这一集的要求不要写进来。

## 最容易做错的地方

- MG 左右以**画面正中 x=540** 对齐，不是 IG 安全区中线 510（012 全部偏左 30px，被用户抓出来）。安全区右边只到 x=960，所以以 540 居中的内容最宽 840px。顶部 MG 不高于 y=270。Hook 标题卡可以偏右放在手势旁边（012 用户确认保留在右侧）。
- 回弹（overshoot）用户明确不要。`nj-kit.jsx` 里的 `pop` / `bounce` / `exitPop` 已改成无回弹，保留了名字，直接用即可。
- ChatCut 不能给 MG 加人像 mask。要把 MG 放在人物后面：MG 全屏放下面，上面一条轨道放同一段素材的拷贝并加 portrait mask。
- MG 素材导入后宽高改不了，要改就重新 push 一个新素材再替换。
- 我听不到声音：音效和音乐是按标题和波形选的，交片时请用户听一遍。
