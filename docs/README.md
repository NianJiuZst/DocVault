# DocVault 文档

## 目录结构

```
docs/
├── README.md              ← 文档索引
├── components/
│   └── WaveArrow.md      ← 波纹箭头组件
└── pages/
    └── home-page.md      ← 首页设计文档
```

## 主题

### 色彩系统

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-bg` | `#0a0a0a` | 首页背景（近纯黑） |
| `--color-text` | `#ffffff` | 主文字白色 |
| `--color-muted` | `#71717a` | 辅助/次要文字（锌灰） |
| `--color-accent` | `#7dd3fc` | 强调色（天蓝） |
| `--color-border` | `rgba(255,255,255,0.07)` | 细线边框 |
| `--color-surface` | `rgba(255,255,255,0.03)` | 卡片/面板背景 |

> [!NOTE]
> 首页采用深色主题；应用内页面（home/*）采用浅色主题 + 暗色模式切换。

### 深色主题变量（已在 globals.css 定义）

```css
.dark {
  --color-bg:     rgb(15, 23, 42);   /* slate-900 */
  --color-surface: rgb(30, 41, 59);  /* slate-800 */
  --color-text:   rgb(226, 232, 240); /* slate-100 */
  --color-border: rgb(51, 65, 85);   /* slate-700 */
}
```
