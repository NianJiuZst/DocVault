import Link from "next/link";
import styles from "./page.module.css";

const navItems = [
  { label: "产品预览", href: "#product" },
  { label: "功能亮点", href: "#features" },
  { label: "立即开始", href: "#cta" },
];

const sidebarDocs = [
  "产品路线图",
  "协作规范",
  "AI 工作流",
  "客户访谈",
];

const editorBullets = [
  "支持块级编辑、标题层级和清晰的文档结构。",
  "团队成员可在同一页面中实时评论、修改与跟进。",
  "知识库片段可直接被 AI Agent 检索并引用到当前文档。",
];

const featureCards = [
  {
    index: "01",
    title: "编辑器",
    description:
      "现代化块级编辑体验，支持结构化排版、长文编写与稳定的日常文档生产流程。",
    highlights: ["块级排版", "聚焦写作"],
  },
  {
    index: "02",
    title: "协作编辑",
    description:
      "多人实时协同、评论和状态同步放在同一个界面中，减少上下文切换成本。",
    highlights: ["实时在线", "评论反馈"],
  },
  {
    index: "03",
    title: "知识库",
    description:
      "内置 RAG 知识库关联能力，让 AI Agent 能基于团队资料给出更准确的输出。",
    highlights: ["RAG 检索", "知识关联"],
  },
  {
    index: "04",
    title: "模板",
    description:
      "沉淀团队模板、项目模板和常用写作框架，快速复用高频内容结构。",
    highlights: ["模板中心", "快速复用"],
  },
  {
    index: "05",
    title: "导入导出",
    description:
      "兼容常见文档流转方式，方便把内容导入 DocVault，或导出到你的外部工作流。",
    highlights: ["灵活迁移", "交付友好"],
  },
];

export default function HomePage() {
  return (
    <div className={`${styles.pageShell} min-h-screen`}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-30">
          <div
            className={`${styles.navSurface} flex items-center justify-between gap-4 rounded-[24px] border border-white/80 px-5 py-4 sm:px-6`}
          >
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                D
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-slate-950">
                DocVault
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="transition hover:text-slate-950"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
              >
                Sign In
              </Link>
              <Link
                href="/home/cloud-docs"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-14 pt-10 md:pt-14">
          <section
            className={`${styles.heroSurface} relative overflow-hidden rounded-[40px] border border-white/80 px-6 py-12 sm:px-8 lg:px-12 lg:py-16`}
          >
            <div className={styles.heroGlow} aria-hidden="true" />

            <div className="relative grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  AI Agent + RAG Workspace
                </span>

                <h1 className="font-display mt-6 text-5xl font-bold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
                  DocVault
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                  现代化协同文档编辑器，内置 AI Agent 与 RAG 知识库关联功能
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/home/cloud-docs"
                    className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(2,132,199,0.8)] transition hover:bg-sky-500"
                  >
                    立即开始
                  </Link>
                  <a
                    href="#product"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    查看产品界面
                  </a>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "实时协作", value: "多人在线编辑" },
                    { label: "知识增强", value: "RAG 关联检索" },
                    { label: "AI Agent", value: "上下文智能辅助" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.26)] backdrop-blur"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.26)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        文档状态
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        团队文档与知识资产持续同步
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Live
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      ["本周协作文档", "124"],
                      ["知识库引用次数", "2.6k"],
                      ["AI Agent 生成草稿", "342"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm text-slate-500">{label}</span>
                        <span className="text-sm font-semibold text-slate-950">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-sky-100 bg-sky-50/90 p-5 shadow-[0_28px_60px_-36px_rgba(14,165,233,0.28)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    AI Agent
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.04em] text-slate-950">
                    让编辑器理解你的知识上下文
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    把协作文档、项目资料和模板资产聚合到一起，输出更可复用的内容结果。
                  </p>

                  <div className="mt-6 rounded-[24px] bg-white/90 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      推荐动作
                    </p>
                    <div className="mt-3 space-y-2">
                      {["生成会议纪要", "关联产品资料", "整理项目模版"].map(
                        (item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="product" className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Product Mockup
              </span>
              <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                DocVault 编辑器把文档、协作与知识库放在同一工作台
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                下面的界面展示了 DocVault 在编辑、评论、知识检索和 AI Agent 辅助之间的统一体验。
              </p>
            </div>

            <div
              className={`${styles.previewSurface} mt-10 overflow-hidden rounded-[32px] border border-slate-200/80`}
            >
              <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_280px]">
                <aside className="border-b border-slate-200/80 bg-white/90 p-5 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                  </div>

                  <div className="mt-6">
                    <p className="font-display text-lg font-bold text-slate-950">
                      DocVault
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Cloud Docs Workspace
                    </p>
                  </div>

                  <div className="mt-8 space-y-3">
                    {sidebarDocs.map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                          index === 0
                            ? "bg-slate-950 text-white shadow-[0_20px_35px_-24px_rgba(15,23,42,0.7)]"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[24px] bg-sky-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      Knowledge Base
                    </p>
                    <div className="mt-3 space-y-2">
                      {["FAQ", "需求说明", "团队规范"].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                <section className="bg-white px-5 py-6 sm:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        协作文档
                      </span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        已同步知识库
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {["AL", "RY", "ZX"].map((item) => (
                        <span
                          key={item}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Editor
                    </p>
                    <h3 className="font-display mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-950">
                      DocVault 产品发布协作方案
                    </h3>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                      团队将在同一个编辑器内完成方案撰写、知识查找、评论反馈与最终输出，减少工具切换和信息割裂。
                    </p>

                    <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                      <p className="text-sm font-semibold text-slate-950">
                        本次发布重点
                      </p>
                      <div className="mt-4 space-y-3">
                        {editorBullets.map((item) => (
                          <div key={item} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                            <p className="text-sm leading-7 text-slate-600">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] bg-white p-5 shadow-[0_22px_45px_-32px_rgba(15,23,42,0.22)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          评论流
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          市场团队建议补充版本对比图，研发团队已在评论中确认并同步处理。
                        </p>
                      </div>

                      <div className="rounded-[24px] bg-sky-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                          模板建议
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          AI Agent 正在基于“发布说明模板”生成标题结构与导出摘要。
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="border-t border-slate-200/80 bg-slate-50/90 p-5 lg:border-l lg:border-t-0">
                  <div className="rounded-[28px] border border-white bg-white p-5 shadow-[0_22px_45px_-32px_rgba(15,23,42,0.24)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      AI Panel
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">
                      当前检索结果
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      已从 8 份项目资料中召回与本次发布相关的背景信息和模板段落。
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {["需求评审", "上线计划", "FAQ", "模板资产"].map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-[28px] border border-sky-100 bg-sky-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      Quick Actions
                    </p>
                    <div className="mt-4 space-y-3">
                      {["生成发布摘要", "插入知识库引用", "导出给项目群"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                              index === 0
                                ? "bg-slate-950 text-white"
                                : "bg-white text-slate-700"
                            }`}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section id="features" className="mt-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Feature Cards
              </span>
              <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                为现代团队准备的 5 个核心能力
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                从编辑器到知识库，从模板到导入导出，DocVault 把高频文档协作流程收敛到一个统一入口。
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {featureCards.map((feature) => (
                <article
                  key={feature.title}
                  className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/88 p-6 shadow-[0_26px_60px_-42px_rgba(15,23,42,0.28)]"
                >
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {feature.index}
                  </span>
                  <h3 className="font-display mt-4 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {feature.highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="cta" className="mt-20">
            <div
              className={`${styles.ctaSurface} overflow-hidden rounded-[36px] border border-white/80 px-6 py-12 text-center sm:px-10 lg:px-14 lg:py-16`}
            >
              <span className="inline-flex items-center rounded-full border border-sky-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Ready To Launch
              </span>
              <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                立即开始，提升你的文档协作效率
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
                用一个更轻、更统一的工作台承接团队写作、知识管理和 AI Agent 协作流程。
              </p>
              <Link
                href="/home/cloud-docs"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                开始使用 DocVault
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200/80 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                D
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-slate-950">
                DocVault
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Modern collaboration for documents, AI workflows, and shared team knowledge.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
