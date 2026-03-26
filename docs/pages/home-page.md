# 首页 (app/page.tsx)

## 概述

首页是 DocVault 的落地页，采用全屏单页设计，无滚动，参考 Vite 官网风格。纯黑背景 + 白色字体 + 三卡片功能介绍 + 波纹箭头 CTA。

## 设计规范

### 色彩系统

```css
--color-bg:       #0a0a0a   /* 近纯黑背景 */
--color-text:     #ffffff   /* 主文字 */
--color-muted:    #71717a   /* 辅助文字（锌灰） */
--color-accent:   #7dd3fc   /* 强调色（天蓝），极少量使用 */
--color-border:   rgba(255,255,255,0.07) /* 卡片细边框 */
```

### 背景

三层 radial-gradient 叠加：

```
Layer 1: ellipse 80%×60% at 50% -10% — 顶部暗紫微光 (rgba(88,28,135,0.18))
Layer 2: ellipse 50%×40% at 80% 100% — 右下角深蓝微光 (rgba(30,58,138,0.12))
Layer 3: #0a0a0a — 底色
```

### 标题

- **"DocVault"**: Inter 800，字号 `clamp(3.5rem, 9vw, 7rem)`，`letter-spacing: -0.03em`
- 标题下方叠加 `rgba(125,211,252,0.15)` 柔光 radial-gradient，模拟微光效果

### 功能卡片

三列 Grid 布局，间距 16px，每列 `minmax(0, 1fr)`：

| 字段 | 值 |
|------|------|
| 布局 | `grid-template-columns: repeat(3, 1fr)` |
| 内边距 | `28px 24px` |
| 圆角 | `16px` |
| 背景 | `rgba(255,255,255,0.03)` |
| 边框 | `1px solid rgba(255,255,255,0.07)` |

**入场动画**：页面加载后三卡片依次入场，`opacity 0→1` + `translateY(28px→0)`，每张延迟 120ms，缓动 `cubic-bezier(0.16, 1, 0.3, 1)`

**悬停动画**：
- `translateY(-8px)` — 卡片上升
- 边框色变 `#7dd3fc20`
- 右上角出现 `rgba(125,211,252,0.06)` 径向渐变
- box-shadow 扩散

**卡片内容**：
- 图标：SVG，28×28，白色，`strokeWidth: 1.5`
- 标题：16px Inter 600，白色
- 描述：14px，行高 1.6，`#71717a`

### 波纹箭头 (WaveArrow)

位于卡片下方，与页面同时入场（延迟 600ms）。

## 页面数据流

```
HomePage (app/page.tsx)
├── 静态数据：features[]
│   └── [icon, title, description] × 3
├── WaveArrow (components/WaveArrow)
│   └── 点击 → useRouter.push("/home/cloud-docs")
```

## 文件结构

```
packages/frontend/app/page.tsx           ← 首页组件
packages/frontend/app/page.module.css    ← 首页样式
packages/frontend/app/__tests__/page.test.tsx  ← 首页测试
packages/frontend/components/WaveArrow.tsx
packages/frontend/components/__tests__/WaveArrow.test.tsx
```

## 测试

| 测试用例 | 说明 |
|---------|------|
| 渲染标题 "DocVault" | 确认标题正常显示 |
| 渲染副标题 | 确认副标题正常显示 |
| 渲染三张功能卡片 | 确认卡片均存在 |
| 渲染 WaveArrow CTA | 确认按钮可交互 |
| 点击 WaveArrow 跳转 | 确认路由跳转至 `/home/cloud-docs` |
| 卡片描述文案完整 | 确认 AI/Yjs/RAG 关键词出现 |
