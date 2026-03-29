import Link from "next/link";
import styles from "./page.module.css";

const FEATURE_CARDS = [
  {
    span: "col-span-4",
    theme: "light",
    icon: "edit_note",
    title: "The Ultimate Editor",
    description:
      "A block-based rich text editor with markdown support and live collaboration. Drag, drop, and nest content effortlessly.",
    cta: "Start Writing",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfEVkwbnL54tNAI9v_22I0bFb7OtTIDBroUCW2-9JbKMg2EYrVqnvIl_jbD_tTeEeZTXWvneXgL1WRB0U0QWqk4DW1iN8kgzM7vwSWi9EAeoInTo1ZroyV4aqNXhPWaw--WQ0DYkPIJIUtRtr6qWpOCSY3L9M7DfkCRQvQ16CR6iEi7lp2JHAoBDl7LUpPNiCgzRS7vQ59dje3c7DPxz9-i8a-Qmb6MIQTuDCrUhohG9rdsaEtCHn5AybzGkDxyoDtDgwBN5VCKgs",
    imageAlt: "Minimalist code editor interface",
  },
  {
    span: "col-span-2",
    theme: "primary",
    icon: "neurology",
    title: "AI Knowledge Engine (RAG)",
    description:
      "Upload your PDFs and docs, and chat with your own private knowledge base. Secure, private, and lightning fast.",
    badge: "1.2k Documents Indexed",
    badgeProgress: "3/4",
  },
  {
    span: "col-span-2",
    theme: "light",
    icon: "extension",
    title: "Infinite Extensibility",
    description:
      "A powerful plugin system to customize your workflow. Integrate with your favorite tools or build your own.",
  },
  {
    span: "col-span-2",
    theme: "light",
    icon: "palette",
    title: "Theme & Customization",
    description:
      "Beautiful dark and light modes with deeply personalized workspace themes that reflect your brand.",
  },
  {
    span: "col-span-2",
    theme: "light",
    icon: "lock",
    title: "Persistence & Security",
    description:
      "End-to-end encrypted cloud storage with robust offline support. Your data is yours, always.",
  },
];

function MaterialIcon({ name, filled = false }: { name: string; filled?: boolean }) {
  const fill = filled ? "'FILL' 1" : "'FILL' 0";
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: `${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  );
}

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
                <MaterialIcon name="play_circle" />
                Watch Demo
              </a>
            </div>

            {/* Hero Mockup */}
            <div className={styles.mockupWrapper}>
              {/* Background glows */}
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
                        <MaterialIcon name="folder_open" />
                        <span>Project Lumina</span>
                      </div>
                      <div className={styles.mockupFileList}>
                        <div className={styles.mockupFileItem}>
                          <MaterialIcon name="description" />
                          <span className={styles.mockupFileSkeleton} />
                        </div>
                        <div className={styles.mockupFileItem}>
                          <MaterialIcon name="description" />
                          <span className={styles.mockupFileSkeletonShort} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.mockupSidebarSection}>
                      <p className={styles.mockupSidebarLabel}>Connected Data</p>
                      <div className={styles.mockupDbItem}>
                        <MaterialIcon name="database" />
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

                    {/* Block quote */}
                    <div className={styles.mockupBlockquote}>
                      <MaterialIcon name="format_quote" />
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
                      <MaterialIcon name="auto_awesome" filled />
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
                    <MaterialIcon name="psychology" />
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
              {FEATURE_CARDS.map((card) => (
                <article
                  key={card.title}
                  className={`${styles.featureCard} ${
                    card.theme === "primary"
                      ? styles.featureCardPrimary
                      : styles.featureCardLight
                  } ${card.span === "col-span-4" ? styles.featureCardWide : ""}`}
                >
                  <div className={styles.featureCardIconWrap}>
                    <MaterialIcon name={card.icon} />
                  </div>
                  <h3 className={styles.featureCardTitle}>{card.title}</h3>
                  <p className={styles.featureCardDesc}>{card.description}</p>

                  {card.image && (
                    <div className={styles.featureCardImageWrap}>
                      <img
                        alt={card.imageAlt}
                        className={styles.featureCardImage}
                        src={card.image}
                      />
                    </div>
                  )}

                  {card.theme === "primary" && card.badge && (
                    <div className={styles.featureCardBadge}>
                      <MaterialIcon name="check_circle" />
                      <span>{card.badge}</span>
                      <div className={styles.featureCardProgress}>
                        <div
                          className={styles.featureCardProgressFill}
                          style={{ width: card.badgeProgress }}
                        />
                      </div>
                    </div>
                  )}
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
              © 2024 DocVault. Crafted for the editorial mind.
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
              <MaterialIcon name="language" />
            </button>
            <button className={styles.footerSocialBtn}>
              <MaterialIcon name="chat" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
