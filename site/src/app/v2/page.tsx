import { CTAButton } from "@/components/cta-button";
import { FeatureCard } from "@/components/feature-card";
import { ImageSection } from "@/components/image-section";
import { IconActivity, IconUsers, IconCheck, IconShield, IconEye, IconClock } from "@/components/icons";

export default function V2Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div>
            <span className="hero-badge">HDIM Validation Platform</span>
            <h1 className="hero-title">
              Real-Time Clinical Intelligence,{" "}
              <span className="hero-highlight">Proven</span>
            </h1>
            <p className="hero-description">
              HDIM ingests any customer profile, synthesizes realistic patient
              populations, and surfaces care gaps, risk scores, and clinical
              insights in real time. This platform proves it works — with live
              data, transparent results, and zero simulation.
            </p>
            <div className="hero-actions">
              <CTAButton href="/v2/platform" variant="primary">
                Explore the Platform
              </CTAButton>
              <CTAButton href="/v2/validation" variant="secondary">
                See Validation Results
              </CTAButton>
            </div>
          </div>
          <ImageSection
            src="/images/hero-dashboard.webp"
            alt="HDIM clinical intelligence dashboard with real-time patient insights"
            width={600}
            height={450}
            priority
          />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="section">
        <div className="section-inner">
          <div className="section-grid-3">
            <FeatureCard
              icon={<IconActivity width={24} height={24} />}
              title="Real-Time Detection"
              description="Care gaps are identified the moment clinical data flows into the platform — no batch jobs, no overnight processing."
            />
            <FeatureCard
              icon={<IconUsers width={24} height={24} />}
              title="Any Population"
              description="Plug in any customer demographic profile and HDIM generates a clinically accurate synthetic population to match."
            />
            <FeatureCard
              icon={<IconCheck width={24} height={24} />}
              title="Proven Results"
              description="Six distinct phenotypes validated against the live platform with 100% accuracy and zero false negatives."
            />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="section" aria-label="Trust indicators">
        <div className="section-inner">
          <div className="trust-bar">
            <div className="trust-item">
              <div className="trust-icon">
                <IconShield width={18} height={18} />
              </div>
              <span>HIPAA Compliant</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <IconEye width={18} height={18} />
              </div>
              <span>WCAG 2.1 AA</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <IconClock width={18} height={18} />
              </div>
              <span>Real-Time Audit</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <IconCheck width={18} height={18} />
              </div>
              <span>SOC 2 Ready</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
