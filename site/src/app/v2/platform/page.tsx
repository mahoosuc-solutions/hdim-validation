import { SectionHeading } from "@/components/section-heading";
import { StepIndicator } from "@/components/step-indicator";
import { ImageSection } from "@/components/image-section";
import { IconUsers, IconDatabase, IconActivity, IconEye } from "@/components/icons";

export default function PlatformPage() {
  return (
    <>
      {/* How It Works */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="How HDIM Works"
            subtitle="From customer profile to real-time clinical intelligence in four steps"
          />
          <div className="steps-row">
            <StepIndicator
              number={1}
              title="Define Profile"
              description="Specify the customer demographic mix — age ranges, chronic conditions, payer types, and regional distribution."
              icon={<IconUsers width={14} height={14} />}
            />
            <StepIndicator
              number={2}
              title="Synthesize Patients"
              description="HDIM generates clinically realistic FHIR R4 patient bundles complete with conditions, medications, labs, and encounters."
              icon={<IconDatabase width={14} height={14} />}
            />
            <StepIndicator
              number={3}
              title="Populate Platform"
              description="Patient bundles are ingested into the live HDIM platform via standard FHIR APIs — the same path real data takes."
              icon={<IconActivity width={14} height={14} />}
            />
            <StepIndicator
              number={4}
              title="Watch Intelligence"
              description="Care gaps, risk scores, quality measures, and clinical alerts surface in real time as the CQL engine processes each patient."
              icon={<IconEye width={14} height={14} />}
            />
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="section">
        <div className="section-inner">
          <SectionHeading
            title="The Data Flow"
            subtitle="Every patient journey follows the same validated pipeline"
          />
          <p style={{
            fontSize: "clamp(16px, 2vw, 18px)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 720,
            margin: "0 auto 48px",
            textAlign: "center",
          }}>
            FHIR R4 bundles flow through the CQL evaluation engine, triggering
            quality measure calculations, care gap detection, and risk
            stratification — all in real time. Every step is auditable, every
            result traceable back to the source clinical data.
          </p>
          <ImageSection
            src="/images/data-flow.webp"
            alt="End-to-end data flow from patient synthesis to clinical intelligence"
            width={1200}
            height={500}
          />
        </div>
      </section>
    </>
  );
}
