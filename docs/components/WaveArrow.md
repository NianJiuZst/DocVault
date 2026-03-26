# WaveArrow 组件

## 概述

`WaveArrow` 是一个可视化导航 CTA 组件，用于首页底部，持续展示一条波动的黑色箭头线条，吸引用户点击后跳转至 `/home/cloud-docs`。

## 设计动机

传统"滑动解锁"交互在桌面端体验不佳，改用横向波纹箭头替代：
- **无需滚动** — 点击即跳转，桌面端友好
- **视觉吸引** — 持续微动画（正弦波位移），暗示可交互
- **纯 SVG 实现** — 无依赖图标库，体积极小

## 设计细节

### 视觉表现

| 元素 | 描述 |
|------|------|
| 标签文字 | `"开始使用"`，颜色 `#71717a`，字号 14px，字间距加宽 |
| 波浪线 | 黑色实线（Bezier Q 曲线），2.5px 描边，SVG 绘制 |
| 箭头 | 右侧三角，纯黑填充，跟随波浪同步右移 |
| 默认动画 | 波幅 8px，周期 1.6s，无限循环 |
| 悬停动画 | 周期缩短至 0.8s，线条加深至 `#3b3b3b`，箭头加速右突 6px |

### 动画原理

SVG `<path>` 的 `d` 属性通过 CSS `@keyframes` 驱动，在两种 Bezier 状态间切换：

```
关键帧 0%:  Q25,2  → 波峰
关键帧 50%: Q25,26 → 波谷
关键帧 100%: 同 0%
```

### 颜色方案

| 状态 | 颜色 |
|------|------|
| 默认线条 | `#000000` |
| 悬停线条 | `#3b3b3b` |
| 悬停箭头 | `#3b3b3b` |
| 标签文字 | `#71717a` |

## 使用方式

```tsx
import WaveArrow from "@/components/WaveArrow";

// 默认：点击跳转 /home/cloud-docs
<WaveArrow />

// 自定义点击行为
<WaveArrow onClick={() => console.log("clicked")} />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onClick` | `() => void` | `undefined` | 提供时调用此函数代替默认导航行为 |
| `className` | `string` | `undefined` | 透传至容器按钮的 className |

## 可访问性

- 渲染为 `<button>` 元素
- `aria-label="开始使用"`
- 键盘可聚焦，可回车触发点击

## 文件结构

```
packages/frontend/components/WaveArrow.tsx
packages/frontend/components/__tests__/WaveArrow.test.tsx
```
