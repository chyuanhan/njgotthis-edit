# njgotthis-edit

NexJarvis「NexJarvis Got This」IG Reels 系列（NJ26_SM_IG_0xx）的剪辑 skill：在 ChatCut Desktop 里照同一套风格剪口播短片（字幕、品牌 MG、NJ bot、缩放、音效、BGM、关注结尾卡）。从已完成的 014 Meeting Minutes 和 012 Email 整理出来。

## 里面有什么

| 路径 | 内容 |
|---|---|
| `SKILL.md` | 主流程和最容易做错的地方 |
| `references/style-spec.md` | 品牌、安全框、字幕、MG、动效、缩放、声音、音效、结尾的具体数值 |
| `references/chatcut-recipes.md` | ChatCut Desktop 的具体做法和已知的坑 |
| `references/episodes.md` | 014、012 的段落和 MG 时间点，以及每一次修改要求 |
| `assets/mg-kit/` | MG 共用组件 `nj-kit.jsx`、字幕模板 `caption-nj.jsx`、可复用的 MG 源码 |
| `assets/sfx/`、`assets/music/` | CC0 音效和 BGM（免署名，来源在 `CREDITS.txt`）|
| `assets/logo/`、`assets/nj-bot-cutout.png`、`assets/ig-reels-safe-frame.png` | NexJarvis logo、NJ bot 图、IG Reels 安全框 |

## 品牌素材和授权

- `assets/logo/` 里的 NexJarvis logo 和 `assets/nj-bot-cutout.png` 的 NJ bot 是 NexJarvis 的品牌素材，只用于 NexJarvis 自己的内容，不开放给其他用途。
- `assets/sfx/`、`assets/music/` 是 CC0，可自由使用，来源见各自的 `CREDITS.txt`。

## 怎么装

需要先装好 ChatCut Desktop，并在 Claude Code 里连上 `chatcut_desktop` MCP。

**Claude Code（推荐）**：把整个文件夹放到 `~/.claude/skills/njgotthis-edit/`。

```bash
git clone https://github.com/chyuanhan/njgotthis-edit.git ~/.claude/skills/njgotthis-edit
```

没有 git 的话，下载 zip 解压，把里面的 `njgotthis-edit` 文件夹放到 `~/.claude/skills/` 下面。装好后开一个新的 Claude Code 对话，说「用 NexJarvis Got This 的风格剪这一集」就会用上。

**Claude 桌面版 / claude.ai**：打开 `njgotthis-edit.skill` 文件，点「Save skill」。

**ChatCut 应用里**：向 ChatCut 的 AI 说「载入 workflow skill 9731a32f-8ef7-45da-a628-8c5a6ac22b87」，它会复制一份到你的账号。这份只有文字，MG 源码和音效仍要照上面装在 `~/.claude/skills/njgotthis-edit/`。
