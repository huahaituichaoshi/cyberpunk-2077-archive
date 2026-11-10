# NET ARCHIVE · 夜之城终端档案

一个介绍《赛博朋克 2077》的中文静态网站。八个页面，纯 HTML + CSS + 少量原生 JS，无构建流程，可直接托管在 GitHub Pages。

## 页面

| 文件 | 章节 | 内容 |
| --- | --- | --- |
| `index.html` | 首页 | 主视觉、数字概览、八章导航、阅读路线 |
| `world.html` | 世界观 | 桌上游戏血统、城市结构、六大分区、权力地图、现实时间轴、术语表 |
| `story.html` | 剧情 | 三条出身、三幕结构、六条结局的代价、《往日之影》 |
| `gameplay.html` | 玩法 | 五大属性、2.0 专长树、义体容量、战斗、破解与超梦、四种流派 |
| `art.html` | 美术 | 四种建筑与时尚风格色板、夜之城黄、视觉母题、音乐 |
| `anime.html` | 动画 | 《边缘行者》第一季与第二季对照、主创更替、评价分歧 |
| `awards.html` | 荣誉 | 销量曲线、Metacritic 对照、获奖记录、争议 |
| `themes.html` | 主旨 | 超人类主义、意识复制、企业统治、死亡与传奇、自由的代价 |

## 目录结构

```
.
├── index.html
├── world.html
├── story.html
├── gameplay.html
├── art.html
├── anime.html
├── awards.html
├── themes.html
└── assets/
    ├── style.css     # 全站视觉系统
    ├── main.js       # 导航高亮 + 系统时钟
    └── favicon.svg
```

## 本地预览

直接双击 `index.html`，或在目录里起一个静态服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 设计

- 配色取自 IP 自身：近黑 `#060608` + 夜之城黄 `#FCEE0A`，青色 `#12E7E2` 与品红 `#FF2E63` 只用于分色偏移与警报感。
- 面板用 `clip-path` 切角，全站覆盖 SVG 噪点与扫描线；标题用 Chakra Petch，正文用 Noto Sans SC，标签用 Share Tech Mono。
- 字体通过自托管镜像加载，不直连 Google Fonts。

## 声明

本站为非官方、非营利的粉丝资料站，内容基于 CD PROJEKT RED 的公开信息与媒体报道整理，用于介绍与评论。CYBERPUNK、CYBERPUNK 2077 及相关标识为 CD PROJEKT S.A. 的商标或注册商标。站内不含游戏素材（截图、原画、音乐），所有视觉元素由 CSS 与 SVG 绘制。

## 数据口径

销量、评分、奖项均标注年份与版本；不同平台分数差异较大，具体见「荣誉」页。若发现事实错误，欢迎提 issue。
