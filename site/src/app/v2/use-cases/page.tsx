import { SectionHeading } from "@/components/section-heading";
import { UseCaseCard } from "@/components/use-case-card";

const useCases = [
  {
    title: "Diabetes Management",
    patient: "Maria Santos, 58 — Type 2 Diabetes (Unmanaged)",
    scenario:
      "Maria's A1C has been climbing for three quarters. HDIM detects the trend in real time, flags the missing endocrinology referral, and identifies two overdue lab orders — before her next primary care visit.",
    outcome: "Care gaps surfaced 47 seconds after data ingestion",
    imageSrc: "/images/use-case-diabetes.webp",
    imageAlt: "Dashboard showing diabetes care gap detection for Maria Santos",
  },
  {
    title: "Preventive Care Gaps",
    patient: "James Chen, 45 — Preventive Screening Overdue",
    scenario:
      "James hasn't completed his colonoscopy screening or annual wellness visit. HDIM identifies all missing preventive measures based on USPSTF guidelines and generates prioritized outreach recommendations.",
    outcome: "3 preventive gaps identified with guideline citations",
    imageSrc: "/images/use-case-preventive.webp",
    imageAlt: "Preventive care gap analysis for James Chen",
  },
  {
    title: "Complex Elderly Care",
    patient: "Dorothy Williams, 82 — Multi-Chronic with Polypharmacy",
    scenario:
      "Dorothy has CHF, COPD, Type 2 Diabetes, and 14 active medications. HDIM stratifies her as high-risk, detects two drug interactions, and surfaces the missed cardiology follow-up — all within one minute.",
    outcome: "High-risk stratification with 2 critical alerts in under 60s",
    imageSrc: "/images/use-case-elderly.webp",
    imageAlt: "Multi-chronic risk stratification for Dorothy Williams",
  },
];

const impactStats = [
  { value: "6", label: "Phenotypes Validated" },
  { value: "< 60s", label: "Detection Time" },
  { value: "100%", label: "Accuracy" },
  { value: "Zero", label: "False Negatives" },
];

export default function UseCasesPage() {
  return (
    <>
      {/* Use Cases */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="Real-World Scenarios"
            subtitle="See how HDIM transforms patient care across clinical contexts"
          />
          <div className="section-grid-3">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.title} {...uc} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="The Impact"
            subtitle="Measurable results from live validation runs"
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 24,
            textAlign: "center",
          }}>
            {impactStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: 32,
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(32px, 4vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
