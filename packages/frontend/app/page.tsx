"use client";
import WaveArrow from "../components/WaveArrow";
import styles from "./page.module.css";

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "AI 知识协同",
    description: "AI 自动解析文档核心内容、生成检索标签，完成创作 — 沉淀 — 复用闭环。",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "实时协作编辑",
    description: "基于 Yjs CRDT 算法实现毫秒级内容同步，网络波动下仍保持流畅协作体验。",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "知识库联动",
    description: "编辑中实时关联 RAG 知识库，AI 自动推荐相关知识片段，无缝衔接创作与沉淀。",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* 背景：纯黑 + 暗紫微光 */}
      <div className={styles.bg} aria-hidden="true" />

      {/* 主内容 */}
      <main className={styles.main}>
        {/* 标题区 */}
        <section className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.titleText}>DocVault</span>
            <span className={styles.titleGlow} aria-hidden="true" />
          </h1>
          <p className={styles.subtitle}>现代化协同文档编辑器</p>
        </section>

        {/* 三卡片 */}
        <section className={styles.features} aria-label="功能特性">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={styles.card}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className={styles.cardIcon}>{feature.icon}</div>
              <h2 className={styles.cardTitle}>{feature.title}</h2>
              <p className={styles.cardDesc}>{feature.description}</p>
            </article>
          ))}
        </section>

        {/* 波纹箭头 */}
        <section className={styles.cta} aria-label="开始使用">
          <WaveArrow />
        </section>
      </main>
    </div>
  );
}
