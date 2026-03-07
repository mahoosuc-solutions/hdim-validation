"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { CTAButton } from "@/components/cta-button";
import { StepIndicator } from "@/components/step-indicator";
import { UseCaseCard } from "@/components/use-case-card";
import { ImageSection } from "@/components/image-section";
import {
  IconShield,
  IconActivity,
  IconUsers,
  IconZap,
  IconDatabase,
  IconEye,
  IconCheck,
  IconTarget,
} from "@/components/icons";

const NAV_SECTIONS = [
  { id: "how-it-works", label: "How It Works" },
  { id: "validation", label: "Validation" },
  { id: "use-cases", label: "Use Cases" },
  { id: "trust", label: "Trust" },
  { id: "contact", label: "Contact" },
];

export default function V1Page() {
  const [activeSection, setActiveSection] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionEls = NAV_SECTIONS.map((s) =>
      document.getElementById(s.id)
    ).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sectionEls.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollNav = (
    <div className="scroll-nav">
      {NAV_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={activeSection === s.id ? "active" : ""}
          aria-current={activeSection === s.id ? "page" : undefined}
        >
          {s.label}
        </a>
      ))}
    </div>
  );

  return (
    <>
      <Header nav={scrollNav} />

      <main id="main-content">
        {/* ── 1. Hero ──────────────────────────────────────────── */}
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-inner">
            <div>
              <span className="hero-badge">
                <IconZap width={14} height={14} />
                AI-Powered Clinical Intelligence
              </span>
              <h1 id="hero-heading" className="hero-title">
                See Your Patient Data{" "}
                <span className="hero-highlight">Come Alive</span>
              </h1>
              <p className="hero-description">
                Plug in your customer profiles and watch as real-time
                intelligence surfaces care gaps, risk scores, and actionable
                insights — all powered by clinically accurate synthetic
                patients flowing through the live HDIM platform.
              </p>
              <div className="hero-actions">
                <CTAButton href="#contact" variant="primary">
                  Request a Demo
                </CTAButton>
                <CTAButton href="#how-it-works" variant="secondary">
                  See How It Works
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

        {/* ── 2. Problem ──────────────────────────────────────── */}
        <section className="section" aria-labelledby="problem-heading">
          <div className="section-inner">
            <div className="section-grid-2">
              <div>
                <SectionHeading
                  title="The Gap Between Data and Action"
                  subtitle="Healthcare data sits in silos. Providers drown in alerts they can't prioritize. Care gaps are discovered after patients leave — or not at all. The result is reactive care, missed opportunities, and preventable harm."
                  align="left"
                />
              </div>
              <ImageSection
                src="/images/problem-fragmented.webp"
                alt="Provider overwhelmed by fragmented data systems"
                width={560}
                height={400}
              />
            </div>
          </div>
        </section>

        {/* ── 3. Solution ─────────────────────────────────────── */}
        <section className="section" aria-labelledby="solution-heading">
          <div className="section-inner">
            <div className="section-grid-2">
              <ImageSection
                src="/images/solution-insights.webp"
                alt="Provider with clear, actionable clinical insights"
                width={560}
                height={400}
              />
              <div>
                <SectionHeading
                  title="Bridge the Gap with Real-Time Intelligence"
                  subtitle="HDIM accepts any customer profile, generates clinically accurate synthetic patients that match your population, and surfaces actionable insights in real time. No waiting. No guessing. Just intelligence that moves at the speed of care."
                  align="left"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. How It Works ─────────────────────────────────── */}
        <section
          id="how-it-works"
          className="section"
          aria-labelledby="how-it-works-heading"
        >
          <div className="section-inner">
            <SectionHeading
              title="How It Works"
              subtitle="From profile to proof in four steps"
            />
            <div className="steps-row">
              <StepIndicator
                number={1}
                title="Define Profile"
                description="Describe your patient population — demographics, conditions, medications, risk factors"
                icon={<IconUsers width={14} height={14} />}
              />
              <StepIndicator
                number={2}
                title="Synthesize Patients"
                description="AI generates clinically accurate FHIR R4 patient bundles matching your profile"
                icon={<IconDatabase width={14} height={14} />}
              />
              <StepIndicator
                number={3}
                title="Populate Platform"
                description="Patients are seeded into the live HDIM platform with full clinical context"
                icon={<IconActivity width={14} height={14} />}
              />
              <StepIndicator
                number={4}
                title="Watch Intelligence"
                description="See care gaps surface, risk scores calculate, and insights arrive in real time"
                icon={<IconEye width={14} height={14} />}
              />
            </div>
          </div>
        </section>

        {/* ── 5. Live Validation ──────────────────────────────── */}
        <section
          id="validation"
          className="section"
          aria-labelledby="validation-heading"
        >
          <div className="section-inner">
            <SectionHeading
              title="We Don't Just Claim It Works — We Prove It"
              subtitle="Six clinically diverse phenotypes tested end-to-end against the live HDIM platform. Every assertion passed."
            />
            <div className="validation-grid">
              <div className="validation-item">
                <div className="validation-status pass" aria-label="Passed">
                  <IconCheck />
                </div>
                <div className="validation-info">
                  <h4>Type 2 Diabetes — Managed</h4>
                  <p>HbA1c controlled, zero care gaps, CQL compliant</p>
                </div>
              </div>
              <div className="validation-item">
                <div className="validation-status pass" aria-label="Passed">
                  <IconCheck />
                </div>
                <div className="validation-info">
                  <h4>Type 2 Diabetes — Unmanaged</h4>
                  <p>High HbA1c detected, 2 care gaps identified, risk flagged</p>
                </div>
              </div>
              <div className="validation-item">
                <div className="validation-status pass" aria-label="Passed">
                  <IconCheck />
                </div>
                <div className="validation-info">
                  <h4>CHF with Polypharmacy</h4>
                  <p>8 medications tracked, high risk correctly scored</p>
                </div>
              </div>
              <div className="validation-item">
                <div className="validation-status pass" aria-label="Passed">
                  <IconCheck />
                </div>
                <div className="validation-info">
                  <h4>Preventive Care Gaps</h4>
                  <p>3 missing screenings identified automatically</p>
                </div>
              </div>
              <div className="validation-item">
                <div className="validation-status pass" aria-label="Passed">
                  <IconCheck />
                </div>
                <div className="validation-info">
                  <h4>Healthy Pediatric</h4>
                  <p>Clean bill of health confirmed, immunizations current</p>
                </div>
              </div>
              <div className="validation-item">
                <div className="validation-status pass" aria-label="Passed">
                  <IconCheck />
                </div>
                <div className="validation-info">
                  <h4>Multi-Chronic Elderly</h4>
                  <p>3 chronic conditions tracked, high risk, low health score</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Use Cases ────────────────────────────────────── */}
        <section
          id="use-cases"
          className="section"
          aria-labelledby="use-cases-heading"
        >
          <div className="section-inner">
            <SectionHeading
              title="Real-World Impact"
              subtitle="See how HDIM transforms clinical workflows across different patient scenarios"
            />
            <div className="section-grid-3">
              <UseCaseCard
                title="Real-Time Diabetes Management"
                patient="Maria, 58 — Managed T2DM"
                scenario="Maria's HbA1c is monitored continuously through the platform. When her latest lab result arrives, HDIM instantly evaluates her against quality measures and care protocols, confirming compliance and surfacing any emerging risks."
                outcome="Care gaps detected and addressed in under 60 seconds"
                imageSrc="/images/use-case-diabetes.webp"
                imageAlt="Diabetes management dashboard showing HbA1c monitoring"
              />
              <UseCaseCard
                title="Preventive Care Compliance"
                patient="James, 45 — Healthy male"
                scenario="James appears healthy, but HDIM cross-references his age, gender, and history against preventive care guidelines. The platform automatically identifies screenings that are overdue and flags them before his next visit."
                outcome="3 overdue screenings flagged before annual visit"
                imageSrc="/images/use-case-preventive.webp"
                imageAlt="Preventive care compliance dashboard with screening alerts"
              />
              <UseCaseCard
                title="Complex Elderly Care"
                patient="Robert, 82 — COPD/CKD/HTN"
                scenario="Robert's three chronic conditions create a complex medication landscape. HDIM tracks all eight active prescriptions, identifies potential interactions, and accurately stratifies his risk level to guide care coordination."
                outcome="Medication interactions caught, risk score accurately stratified"
                imageSrc="/images/use-case-elderly.webp"
                imageAlt="Complex care coordination dashboard for multi-chronic patient"
              />
            </div>
          </div>
        </section>

        {/* ── 7. Trust & Compliance ───────────────────────────── */}
        <section
          id="trust"
          className="section"
          aria-labelledby="trust-heading"
        >
          <div className="section-inner">
            <SectionHeading
              title="Enterprise-Grade Trust"
              subtitle="Built from the ground up for healthcare's strictest requirements"
            />
            <div className="section-grid-2" style={{ gap: "24px" }}>
              <div className="validation-item">
                <div className="trust-icon">
                  <IconShield />
                </div>
                <div className="validation-info">
                  <h4>HIPAA Compliant</h4>
                  <p>
                    End-to-end encryption, audit trails, access controls
                  </p>
                </div>
              </div>
              <div className="validation-item">
                <div className="trust-icon">
                  <IconTarget />
                </div>
                <div className="validation-info">
                  <h4>WCAG 2.1 AA</h4>
                  <p>
                    Accessible to all users, validated with assistive technology
                  </p>
                </div>
              </div>
              <div className="validation-item">
                <div className="trust-icon">
                  <IconEye />
                </div>
                <div className="validation-info">
                  <h4>Real-Time Audit</h4>
                  <p>
                    Every action logged, every access tracked, complete
                    transparency
                  </p>
                </div>
              </div>
              <div className="validation-item">
                <div className="trust-icon">
                  <IconShield />
                </div>
                <div className="validation-info">
                  <h4>SOC 2 Ready</h4>
                  <p>
                    Security controls designed for enterprise healthcare
                    environments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. CTA ──────────────────────────────────────────── */}
        <section
          id="contact"
          className="section"
          aria-labelledby="cta-heading"
          style={{ textAlign: "center" }}
        >
          <div className="section-inner">
            <SectionHeading
              title="Ready to See Your Population Come to Life?"
              subtitle="Schedule a personalized demo and watch HDIM transform your patient data into real-time clinical intelligence."
            />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CTAButton href="#contact" variant="primary">
                Schedule a Demo
              </CTAButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
