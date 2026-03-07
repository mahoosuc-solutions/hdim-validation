import { SectionHeading } from "@/components/section-heading";
import { FeatureCard } from "@/components/feature-card";
import { IconCheck, IconTarget, IconShield, IconDatabase } from "@/components/icons";

const phenotypes = [
  {
    name: "Type 2 Diabetes — Managed",
    mrn: "SYN-T2DM-M-001",
    status: "pass" as const,
  },
  {
    name: "Type 2 Diabetes — Unmanaged",
    mrn: "SYN-T2DM-U-002",
    status: "pass" as const,
  },
  {
    name: "CHF with Polypharmacy",
    mrn: "SYN-CHF-P-003",
    status: "pass" as const,
  },
  {
    name: "Preventive Care Gaps",
    mrn: "SYN-PG-004",
    status: "pass" as const,
  },
  {
    name: "Healthy Pediatric",
    mrn: "SYN-PED-H-005",
    status: "pass" as const,
  },
  {
    name: "Multi-Chronic Elderly",
    mrn: "SYN-MCE-006",
    status: "pass" as const,
  },
];

export default function ValidationPage() {
  return (
    <>
      {/* Validation Results */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="Validation Results"
            subtitle="6 synthetic phenotypes tested against the live platform"
          />
          <div className="validation-grid">
            {phenotypes.map((p) => (
              <div key={p.mrn} className="validation-item">
                <div className={`validation-status ${p.status}`}>
                  <IconCheck width={20} height={20} />
                </div>
                <div className="validation-info">
                  <h4>{p.name}</h4>
                  <p>{p.mrn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Test */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="What We Test"
            subtitle="Every dimension of clinical intelligence is validated"
          />
          <div className="section-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <FeatureCard
              icon={<IconTarget width={24} height={24} />}
              title="Care Gap Detection"
              description="Validates that overdue screenings, missing immunizations, and unmet preventive measures are correctly identified for each phenotype."
            />
            <FeatureCard
              icon={<IconShield width={24} height={24} />}
              title="Risk Stratification"
              description="Confirms that risk scores accurately reflect clinical complexity — from healthy pediatric patients to multi-chronic elderly."
            />
            <FeatureCard
              icon={<IconCheck width={24} height={24} />}
              title="CQL Compliance"
              description="Ensures all Clinical Quality Language measures execute correctly and return expected results against FHIR R4 resources."
            />
            <FeatureCard
              icon={<IconDatabase width={24} height={24} />}
              title="Clinical Data Integrity"
              description="Verifies that patient bundles maintain referential integrity and clinical consistency throughout the entire pipeline."
            />
          </div>
        </div>
      </section>
    </>
  );
}
