import { SectionHeading } from "@/components/section-heading";
import { CTAButton } from "@/components/cta-button";
import { IconShield, IconEye, IconClock, IconCheck } from "@/components/icons";

export default function ContactPage() {
  return (
    <>
      {/* Contact CTA */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="See It For Yourself"
            subtitle="Schedule a demo with your patient population"
          />
          <div style={{
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
          }}>
            <div style={{
              padding: 48,
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
            }}>
              <p style={{
                fontSize: "clamp(16px, 2vw, 18px)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                marginBottom: 16,
              }}>
                Bring your own demographic profile and watch HDIM generate a
                synthetic patient population tailored to your organization. See
                care gaps, risk scores, and quality measures surface in real
                time — no setup required.
              </p>
              <p style={{
                fontSize: 15,
                color: "var(--color-text-muted)",
                marginBottom: 32,
              }}>
                Demos typically run 30 minutes and include a live walkthrough
                of patient synthesis, FHIR ingestion, CQL evaluation, and the
                clinical intelligence dashboard.
              </p>
              <CTAButton href="mailto:demo@hdim.health" variant="primary">
                Schedule a Demo
              </CTAButton>
            </div>
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
