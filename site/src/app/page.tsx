import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="hero-section">
          <div
            className="hero-inner"
            style={{
              gridTemplateColumns: "1fr",
              textAlign: "center",
              justifyItems: "center",
            }}
          >
            <div>
              <div className="hero-badge">
                <span>3 Design Concepts</span>
              </div>
              <h1 className="hero-title">
                HDIM Validation Platform{" "}
                <span className="hero-highlight">Design Review</span>
              </h1>
              <p
                className="hero-description"
                style={{ margin: "0 auto 32px" }}
              >
                Three approaches to telling the HDIM validation story. Each
                version demonstrates the same platform capabilities with a
                different narrative structure. Review all three and choose the
                approach that resonates most with your audience.
              </p>
              <div
                className="hero-actions"
                style={{ justifyContent: "center" }}
              >
                <Link href="/v1" className="cta-button primary">
                  V1: Single-Page Scroll
                </Link>
                <Link href="/v2" className="cta-button secondary">
                  V2: Multi-Page Site
                </Link>
                <Link href="/v3" className="cta-button secondary">
                  V3: Guided Story
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <div className="section-grid-3">
              <article className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 20V10M18 20V4M6 20v-4" />
                  </svg>
                </div>
                <h3 className="feature-title">V1: Single-Page Scroll</h3>
                <p className="feature-description">
                  One continuous narrative flow. All content on a single page
                  with smooth scrolling between sections. Best for sharing a
                  single URL and natural storytelling.
                </p>
                <Link
                  href="/v1"
                  className="cta-button secondary"
                  style={{ marginTop: 16, fontSize: 14, padding: "10px 20px" }}
                >
                  View Version 1
                </Link>
              </article>

              <article className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </div>
                <h3 className="feature-title">V2: Multi-Page Site</h3>
                <p className="feature-description">
                  Traditional site structure with dedicated pages for Platform,
                  Validation, Use Cases, and Contact. Best for organized content
                  and deep-linking to specific topics.
                </p>
                <Link
                  href="/v2"
                  className="cta-button secondary"
                  style={{ marginTop: 16, fontSize: 14, padding: "10px 20px" }}
                >
                  View Version 2
                </Link>
              </article>

              <article className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                </div>
                <h3 className="feature-title">V3: Guided Story</h3>
                <p className="feature-description">
                  Step-through narrative following Dr. Sarah Chen through a day
                  with HDIM. Most controlled storytelling with keyboard
                  navigation. Best for presentations and demos.
                </p>
                <Link
                  href="/v3"
                  className="cta-button secondary"
                  style={{ marginTop: 16, fontSize: 14, padding: "10px 20px" }}
                >
                  View Version 3
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
