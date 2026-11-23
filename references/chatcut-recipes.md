# ChatCut Desktop 操作方法

这一集一集剪下来摸出来的做法和坑。工具名都是 `chatcut_desktop` 服务器上的（Claude Code 里是 `mcp__chatcut_desktop__<工具名>`）。每次调用都要带 `projectId`；改非当前时间线时还要带 `timelineId`。

## 目录
1. 专案和素材
2. MG 素材
3. 粗剪
4. 声音
5. 字幕
6. 把 MG 放在人物后面
7. 关键帧和画面缩放
8. 验证
9. 版本和导出
10. 记忆
11. 已知的坑

---

## 1. 专案和素材

- `list_projects` 找专案；`create_project` 建新的；`read_project` 看专案文件夹位置和设定；`manage_design_style` 套用「NexJarvis」（`37d0e17b-b116-4a03-b088-1b0dd8aac66e`）。
- 专案包在 `~/Library/Application Support/ChatCut/projects/<projectId>/project.chatcutproject/`，MG 和字幕源码放在里面的 `workspace/nexjarvis-mg/`。新一集开工时拷组件：

  ```bash
  P="$HOME/Library/Application Support/ChatCut/projects/<projectId>/project.chatcutproject/workspace/nexjarvis-mg"
  mkdir -p "$P" && cp -R ~/.claude/skills/njgotthis-edit/assets/mg-kit/. "$P/" && cp ~/.claude/skills/njgotthis-edit/assets/ig-reels-safe-frame.png "$P/"
  ```

  （在原剪辑者的电脑上，同样的文件也在 012 专案的 `workspace/nexjarvis-mg/` 里。）
- 导入素材用 `push_asset`（`filePath` 绝对路径）：口播视频会自动云端转写；音效和音乐加 `skipTranscription:true`，放进 `folder`（例如「音效」「音乐」「品牌」）；logo 和 NJ bot 图当 image 导入，拿到的 asset ID 填进 MG 的图片属性。
- 素材元数据和抽帧用 `inspect_asset`（原剪辑者的 Mac 上没有 ffmpeg / ffprobe，也没有 Python 图像库，所以一律走 ChatCut）。

## 2. MG 素材

- 导入：`push_asset`，`filePath` 指向 `.jsx`，`type:"motion-graphic"`，给 `width`、`height`（像素）、`duration`（微秒），再给 `properties` 属性表：`[{key, label, type: text|number|color|boolean|image, defaultValue}]`。属性在 JSX 里用 `item.props.<key>` 读，时间类属性用秒。
- 常用画布：顶部 MG 1000×400 或 1000×450；Hook 标题卡 620×440；产品页面、CTA、结尾背景 1080×1920。
- **源码会热更新**：改 `.jsx`（包括共用的 `nj-kit.jsx`）后，已经放上时间线的 MG 会自动更新，不用重新导入。改之前先把旧文件备份一份。
- **宽高导入后改不了**：要换尺寸就重新 `push_asset` 一个新素材，再用 `edit_item` 的 `updates:[{id, assetId:<新>}]` 替换（会清掉旧的 propertyOverrides，要一起重新给）。
- 改属性定义或素材名：`edit_asset` `action:"update"`，`json` 里给**完整的** `properties` 列表（只给一部分会把其他的覆盖掉）。
- 放到时间线：`edit_item` `adds:[{type:"motion-graphic", assetId, trackId, startFrame, durationFrames, left, top, width, height}]`；单个实例的值用 `propertyOverrides`。
- 旧版本不用了就移到素材库里的「旧版 MG（已不用）」文件夹，不要直接删。

## 3. 粗剪

- 用 `read_script` 看逐句文本，`apply_script` 按文本删句。如果报错「A silence marker must follow a spoken Script row」，把被删句子后面的静音行一起删掉。
- 要精确边界时，直接用 `edit_item` 重建片段（`sourceIn` 是微秒，`durationFrames` 是帧），视频和它连着的音频会一起动。
- 用 `preview_timeline` 的 `transcript` view 取每个词的时间，后面 MG、缩放、音效都要对这些时间点。

## 4. 声音

- 降噪：`isolate_voice` 对口播音频 clip 做 AI 人声隔离。导出前用 `inspect_item`（`module:"audio"`）确认 `speech-enhance` 的状态是 completed。
- 每段口播：`sourceProcessing` 里 `normalize-loudness` 的 `targetLufs: -16`（用 `inspect_item` `module:"audio"` 看当前设置和改法）。
- 总线 limiter：`edit_item` `adds:[{type:"audio-effect", assetId:"builtin:audio-effect-limiter", target:"master", propertyOverrides:{inputGainDb:13, releaseMs:80}}]`。
- 量响度：`preview_timeline` `views:["sound"]`，看每条轨的电平、整体 LUFS 和峰值。调 clip 的 `decibelAdjustment` 到人声约 −11.9 dBFS RMS、整体约 −9.5 LUFS。

## 5. 字幕

- 开字幕：`edit_captions` `action:"enable"`。
- 套模板：`set_track_style`，`style:{template:{path:"<专案>/workspace/nexjarvis-mg/caption-nj.jsx", runtime:"remotion", properties:{shadowOpacity:0.6}}}`，`mode:"merge"`。
- 位置：`update_track` `layout:{left:120, top:1290, width:840, height:220}`。改整条轨，不要逐张改。
- 读：`read_captions`（`words:true` 才有每个字的 token ID）。数字数时看 `displayText`，不要看原始 tokens（改过的字只在 displayText 里）。
- 改字：`set_card_text`；重点字：`set_card_emphasis` `spans:[{text, emphasis:true}]`（每张都手动设）；拆：`split_card` `beforeTokenId`；合：`merge_cards`。一次改很多张用 `batch`。每次写入要带上一次读到的 `revision`。
- 模板读的属性：`textSize`（默认 66）、`lineLimit`（默认 11 个全角字，超过自动折两行，所以卡片本身要先拆到 8 字以内）、`shadowOpacity`、`pillShadowOpacity`（默认 0.4）、`keyBackground`（默认白）。

## 6. 把 MG 放在人物后面

ChatCut 不能给 MG 加人像 mask（会报「Unsupported portrait mask on item motion-graphic」）。做法：

1. V1：原来的口播片段。
2. V2：全屏 MG（产品页面），盖住 V1。
3. V3「人物抠像」：用 `edit_item` `adds:[{fromItemId:<V1 那段的 ID>, media:"video", trackId:<V3>, startFrame, durationFrames}]` 拷一份同样的画面（位置、缩放关键帧要一样），再加人像 mask：

   ```json
   {"id":"<V3 片段 ID>","mask":{"nodes":[{"kind":"portrait","parameters":{"feather":2,"matteOffset":0}}]}}
   ```

4. 最上面：IG 安全框参考（关闭）。

- 只拷画面（`media:"video"`），不要再多一份声音。
- 抠像只在静止帧上检查过边缘，交片时提醒用户看一下头发和手的边。

## 7. 关键帧和画面缩放

- `edit_item` `keyframes`：先 `set`，再对每个区间的左端点 `curve`：

  ```json
  [{"itemId":"<片段>","path":"transform.width","action":"set","frame":420,"value":1209.6},
   {"itemId":"<片段>","path":"transform.width","action":"curve","frame":420,"easing":"ease-out-cubic"}]
  ```

  `frame` 是时间线上的绝对帧。缩放要同时设 `transform.width`、`transform.height`、`transform.x`、`transform.y` 四条，每条都要 `curve`。返回结果很大，会存成文件，用 Python 读来确认。
- 以某个点为锚放大（例如主持人头顶 `(ax, ay)`，ax 取 540）：从缩放 s0、位置 (left0, top0) 变到 s 时，
  `width = 1080·s`、`height = 1920·s`、`left = ax − (ax − left0)·s/s0`、`top = ay − (ay − top0)·s/s0`。
  再检查不露黑边：`left ≤ 0`、`top ≤ 0`、`left + width ≥ 1080`、`top + height ≥ 1920`；露边就把锚点往中间挪。
- 跳剪对齐：后一段在自己第一帧加一个关键帧，值等于前一段最后一帧的位置和大小，然后到它原本的第一个缩放关键帧之间慢慢过渡。

## 8. 验证

- **位置和对齐**：`preview_timeline` `viewerFrames:[…]` 加 `outline:[MG 片段 ID…]`，会给每个 MG 实际画出来的范围（0–1）。检查：中线 `(x0+x1)/2 × 1080 ≈ 540`；右边 `x1 ≤ 0.889`（960）；左边 `x0 ≥ 0.056`（60）；顶部 `y0 ≥ 0.14`（270）。
- **安全框**：把安全框那条轨临时打开叠着看几帧，看完关掉。
- **切点**：看每个切点前后各一两帧，构图有没有跳、MG 有没有从头重播。
- **声音**：`views:["sound"]` 量 LUFS 和峰值。
- **整段**：`views:["clip"]` 渲染一段，看有没有黑帧和突然的画面跳变。
- 抽帧只能看静止画面；动画手感、声音、抠像边缘要请用户看一遍，交片时说清楚。

## 9. 版本和导出

- 另做版本：`manage_timelines` `action:"duplicate"`，给新时间线起清楚的名字（例如「含 NJ bot 版」）。改别的时间线时 `edit_item` 带 `timelineId`。
- 导出（只在用户要时）：`export`，1080×1920、25fps，输出到该集的 `output/`；用 `track_progress` `target:"export"` 等完成。
- 导出前确认：安全框参考轨是关的；没有被切开的 MG；人声隔离处理完了。

## 10. 记忆

- ChatCut 记忆（`manage_memory`）里和这个系列有关的：「IG Reels 安全框」「NexJarvis Got This MG 排版与动效」「NexJarvis 品牌视频规则」「NJ bot 角色素材」。写之前先 `read` 拿到 `version`。
- 用户给新的系列级规则时，记忆和这个 skill 都要更新。

## 11. 已知的坑

- **MG 被切开会从头播**：一个 MG 只能是一整段。用户或 ripple 操作把它切开时，删掉后一段、把前一段拉回原长度。
- **ripple 裁剪不会带着 MG 走**：字幕跟着声音自动移，MG 不会。用户手动改过时间线后，要把 MG 重新对回它对应的那句话。
- `inspect_item` 用 `module` 时一次只能查一个 ID。
- MG 里的 `interpolate` 输入区间必须严格递增；属性可能是 0 或负数时（例如 `clickTime:-1` 表示不要点击），先把区间长度夹到 ≥ 0.02 秒。
- 照片图库 shell 读不到（macOS 隐私限制）；原剪辑者的 Mac 上 ffmpeg、ffprobe、PIL 都没有，需要抠图时用 Swift + Vision（`VNGenerateForegroundInstanceMaskRequest`）。
- Openverse / Freesound 偶尔 502，Wikimedia 下载多了会 429 要求停下：晚点再试，不要绕过。
