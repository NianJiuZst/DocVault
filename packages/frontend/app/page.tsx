import Link from "next/link";
import {
  MdEditNote,
  MdPlayCircle,
  MdFolderOpen,
  MdDescription,
  MdStorage,
  MdFormatQuote,
  MdAutoAwesome,
  MdPsychology,
  MdCheckCircle,
  MdLanguage,
  MdChat,
  MdExtension,
  MdPalette,
  MdLock,
} from "react-icons/md";
import styles from "./page.module.css";

const FEATURES = [
  {
    theme: "light",
    icon: <MdEditNote size={24} />,
    title: "The Ultimate Editor",
    description:
      "A block-based rich text editor with markdown support and live collaboration. Drag, drop, and nest content effortlessly.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfEVkwbnL54tNAI9v_22I0bFb7OtTIDBroUCW2-9JbKMg2EYrVqnvIl_jbD_tTeEeZTXWvneXgL1WRB0U0QWqk4DW1iN8kgzM7vwSWi9EAeoInTo1ZroyV4aqNXhPWaw--WQ0DYkPIJIUtRtr6qWpOCSY3L9M7DfkCRQvQ16CR6iEi7lp2JHAoBDl7LUpPNiCgzRS7vQ59dje3c7DPxz9-i8a-Qmb6MIQTuDCrUhohG9rdsaEtCHn5AybzGkDxyoDtDgwBN5VCKgs",
    imageAlt: "Minimalist code editor",
  },
  {
    theme: "primary",
    icon: <MdAutoAwesome size={24} />,
    title: "AI Knowledge Engine (RAG)",
    description:
      "Upload your PDFs and docs, and chat with your own private knowledge base. Secure, private, and lightning fast.",
    badge: "1.2k Documents Indexed",
    badgeProgress: "75%",
  },
  {
    theme: "light",
    icon: <MdExtension size={24} />,
    title: "Infinite Extensibility",
    description:
      "A powerful plugin system to customize your workflow. Integrate with your favorite tools or build your own.",
  },
  {
    theme: "light",
    icon: <MdPalette size={24} />,
    title: "Theme & Customization",
    description:
      "Beautiful dark and light modes with deeply personalized workspace themes that reflect your brand.",
  },
  {
    theme: "light",
    icon: <MdLock size={24} />,
    title: "Persistence & Security",
    description:
      "End-to-end encrypted cloud storage with robust offline support. Your data is yours, always.",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Top Navigation Bar */}
      <nav className={styles.topNav}>
        <div className={styles.navInner}>
          <span className={styles.navLogo}>DocVault</span>

          <div className={styles.navLinks}>
            <a href="#product" className={styles.navLinkActive}>Product</a>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <a href="#plugins" className={styles.navLink}>Plugins</a>
          </div>

          <div className={styles.navActions}>
            <Link href="/auth/signin" className={styles.navSignIn}>Sign In</Link>
            <Link href="/home/cloud-docs" className={styles.navGetStarted}>Get Started</Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            {/* Badge */}
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              <span>Now in Public Beta</span>
            </div>

            {/* Headline */}
            <h1 className={styles.heroTitle}>
              Your Entire Workspace,{" "}
              <span className={styles.heroTitleAccent}>Supercharged</span> by AI.
            </h1>

            {/* Subtitle */}
            <p className={styles.heroSubtitle}>
              Combine notes, documents, and AI-powered knowledge bases (RAG) in one
              seamless editor. Built for builders, thinkers, and teams.
            </p>

            {/* CTA Buttons */}
            <div className={styles.heroButtons}>
              <Link href="/home/cloud-docs" className={styles.heroBtnPrimary}>
                Start Writing for Free
              </Link>
              <a href="#product" className={styles.heroBtnSecondary}>
                <MdPlayCircle size={20} />
                Watch Demo
              </a>
            </div>

            {/* Hero Mockup */}
            <div className={styles.mockupWrapper}>
              <div className={styles.mockupGlowPrimary} />
              <div className={styles.mockupGlowSecondary} />

              {/* Browser window */}
              <div className={styles.browserWindow}>
                {/* Sidebar */}
                <div className={styles.mockupSidebar}>
                  <div className={styles.mockupDots}>
                    <span className={styles.mockupDotRed} />
                    <span className={styles.mockupDotYellow} />
                    <span className={styles.mockupDotGreen} />
                  </div>

                  <div className={styles.mockupSidebarContent}>
                    <div className={styles.mockupSidebarSection}>
                      <p className={styles.mockupSidebarLabel}>Knowledge Base</p>
                      <div className={styles.mockupFolderItem}>
                        <MdFolderOpen size={16} />
                        <span>Project Lumina</span>
                      </div>
                      <div className={styles.mockupFileList}>
                        <div className={styles.mockupFileItem}>
                          <MdDescription size={14} />
                          <span className={styles.mockupFileSkeleton} />
                        </div>
                        <div className={styles.mockupFileItem}>
                          <MdDescription size={14} />
                          <span className={styles.mockupFileSkeletonShort} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.mockupSidebarSection}>
                      <p className={styles.mockupSidebarLabel}>Connected Data</p>
                      <div className={styles.mockupDbItem}>
                        <MdStorage size={14} />
                        <span className={styles.mockupFileSkeletonLong} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editor area */}
                <div className={styles.mockupEditor}>
                  <div className={styles.mockupEditorContent}>
                    <div className={styles.mockupHeadingSkeleton} />
                    <div className={styles.mockupTextGroup}>
                      <div className={styles.mockupTextLine} />
                      <div className={styles.mockupTextLine} />
                      <div className={styles.mockupTextLineShort} />
                    </div>

                    <div className={styles.mockupBlockquote}>
                      <MdFormatQuote size={20} />
                      <div className={styles.mockupBlockquoteLines}>
                        <div className={styles.mockupTextLine} />
                        <div className={styles.mockupTextLineShort} />
                      </div>
                    </div>

                    <div className={styles.mockupTextGroup}>
                      <div className={styles.mockupTextLine} />
                      <div className={styles.mockupTextLineShort} />
                    </div>
                  </div>
                </div>

                {/* Floating AI bubbles */}
                <div className={styles.aiBubble1}>
                  <div className={styles.aiBubble1Header}>
                    <div className={styles.aiBubble1Icon}>
                      <MdAutoAwesome size={14} color="#fff" />
                    </div>
                    <span className={styles.aiBubble1Title}>Contextual Analysis</span>
                  </div>
                  <div className={styles.aiBubble1Lines}>
                    <div className={styles.aiBubbleLine} />
                    <div className={styles.aiBubbleLineShort} />
                    <div className={styles.aiBubbleLine} />
                  </div>
                  <div className={styles.aiBubble1Footer}>
                    <span className={styles.aiBubbleStatusDot} />
                    <span>Generating Insights</span>
                  </div>
                </div>

                <div className={styles.aiBubble2}>
                  <div className={styles.aiBubble2Header}>
                    <MdPsychology size={16} />
                    <span>Knowledge Map</span>
                  </div>
                  <div className={styles.aiBubble2Bars}>
                    <span className={styles.aiBar1} />
                    <span className={styles.aiBar2} />
                    <span className={styles.aiBar3} />
                    <span className={styles.aiBar4} />
                    <span className={styles.aiBar5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className={styles.features}>
          <div className={styles.featuresInner}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.featuresTitle}>Engineered for Focus</h2>
              <p className={styles.featuresSubtitle}>
                Every feature is designed to eliminate friction between your thoughts
                and the digital canvas.
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {/* First row: wide card + narrow primary card */}
              <article className={`${styles.featureCard} ${styles.featureCardLight} ${styles.featureCardWide}`}>
                <div className={styles.featureCardIconWrap}>{FEATURES[0].icon}</div>
                <h3 className={styles.featureCardTitle}>{FEATURES[0].title}</h3>
                <p className={styles.featureCardDesc}>{FEATURES[0].description}</p>
                <div className={styles.featureCardImageWrap}>
                  <img
                    alt={FEATURES[0].imageAlt}
                    className={styles.featureCardImage}
                    src={FEATURES[0].image}
                  />
                </div>
              </article>

              <article className={`${styles.featureCard} ${styles.featureCardPrimary}`}>
                <div className={`${styles.featureCardIconWrap} ${styles.featureCardIconWrapPrimary}`}>
                  {FEATURES[1].icon}
                </div>
                <h3 className={`${styles.featureCardTitle} ${styles.featureCardTitleLight}`}>
                  {FEATURES[1].title}
                </h3>
                <p className={`${styles.featureCardDesc} ${styles.featureCardDescLight}`}>
                  {FEATURES[1].description}
                </p>
                <div className={styles.featureCardBadge}>
                  <MdCheckCircle size={14} />
                  <span>{FEATURES[1].badge}</span>
                  <div className={styles.featureCardProgress}>
                    <div
                      className={styles.featureCardProgressFill}
                      style={{ width: FEATURES[1].badgeProgress }}
                    />
                  </div>
                </div>
              </article>

              {/* Second row: 3 narrow cards */}
              {FEATURES.slice(2).map((feature) => (
                <article
                  key={feature.title}
                  className={`${styles.featureCard} ${styles.featureCardLight}`}
                >
                  <div className={styles.featureCardIconWrap}>{feature.icon}</div>
                  <h3 className={styles.featureCardTitle}>{feature.title}</h3>
                  <p className={styles.featureCardDesc}>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <div className={styles.ctaGlowLeft} />
            <div className={styles.ctaGlowRight} />

            <h2 className={styles.ctaTitle}>
              Ready to transform your productivity?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join 50,000+ users today and experience the future of digital
              knowledge management.
            </p>

            <div className={styles.ctaButtons}>
              <Link href="/home/cloud-docs" className={styles.ctaBtnPrimary}>
                Create Your Workspace
              </Link>
              <a href="#contact" className={styles.ctaBtnSecondary}>
                Talk to Sales
              </a>
            </div>

            <div className={styles.ctaLogos}>
              <span className={styles.ctaLogoItem}>Partner 1</span>
              <span className={styles.ctaLogoItem}>Partner 2</span>
              <span className={styles.ctaLogoItem}>Partner 3</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>DocVault</span>
            <p className={styles.footerTagline}>
              © 2026 DocVault. Crafted for the editorial mind.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
            <a href="#">Changelog</a>
            <a href="#">Contact</a>
          </div>

          <div className={styles.footerSocial}>
            <button className={styles.footerSocialBtn}>
              <MdLanguage size={16} />
            </button>
            <button className={styles.footerSocialBtn}>
              <MdChat size={16} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
