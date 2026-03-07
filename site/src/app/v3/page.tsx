"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { ImageSection } from "@/components/image-section";
import { CTAButton } from "@/components/cta-button";
import {
  IconUsers,
  IconAlertCircle,
  IconDatabase,
  IconZap,
  IconHeart,
  IconTarget,
} from "@/components/icons";

interface StoryStep {
  label: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  icon: React.ReactNode;
}

const steps: StoryStep[] = [
  {
    label: "CHAPTER 01",
    title: "Meet Dr. Sarah Chen",
    description:
      "Every morning, Dr. Chen reviews her panel of 200 patients. Buried in EHR alerts, lab results, and care protocols, she knows gaps exist \u2014 but finding them takes hours she doesn\u2019t have.",
    imageSrc: "/images/story-morning.webp",
    imageAlt: "Healthcare provider beginning her day at a modern clinic",
    icon: <IconUsers width="24" height="24" />,
  },
  {
    label: "CHAPTER 02",
    title: "The Hidden Crisis",
    description:
      "Across her panel, 3 patients have overdue screenings. 2 have uncontrolled chronic conditions. 1 elderly patient has a dangerous medication interaction. None of these are visible in her current workflow. The data exists \u2014 but it\u2019s trapped in silos.",
    imageSrc: "/images/problem-fragmented.webp",
    imageAlt: "Fragmented health data across disconnected systems",
    icon: <IconAlertCircle width="24" height="24" />,
  },
  {
    label: "CHAPTER 03",
    title: "A New Approach",
    description:
      "Dr. Chen\u2019s health system deploys HDIM. They define their patient demographics \u2014 age distributions, prevalent conditions, medication patterns, risk factors. The platform generates a synthetic population matching their exact profile, and the validation begins.",
    imageSrc: "/images/story-platform.webp",
    imageAlt:
      "Elegant platform interface receiving patient population configuration",
    icon: <IconDatabase width="24" height="24" />,
  },
  {
    label: "CHAPTER 04",
    title: "Watch It Happen",
    description:
      "As synthetic patients flow through the system, intelligence surfaces in real time. Care gaps are identified in under 60 seconds. Risk scores calculate automatically. CQL quality measures evaluate continuously. Dr. Chen can see exactly what the platform will catch \u2014 before a single real patient is affected.",
    imageSrc: "/images/solution-insights.webp",
    imageAlt:
      "Real-time clinical alerts and care gap notifications appearing",
    icon: <IconZap width="24" height="24" />,
  },
  {
    label: "CHAPTER 05",
    title: "The Moment That Matters",
    description:
      "Mr. Torres, 67, arrives for a routine visit. Before Dr. Chen opens his chart, HDIM has already flagged: uncontrolled HbA1c at 9.2%, overdue retinopathy screening, and nephropathy risk. The care gaps that would have been missed are now actionable \u2014 before Mr. Torres leaves the building.",
    imageSrc: "/images/hero-dashboard.webp",
    imageAlt:
      "Provider reviewing actionable clinical intelligence with patient context",
    icon: <IconHeart width="24" height="24" />,
  },
  {
    label: "CHAPTER 06",
    title: "Your Population, Your Proof",
    description:
      "Every health system is different. Every patient population has unique patterns. HDIM doesn\u2019t ask you to trust a demo \u2014 it asks you to validate with your own data. Define your population. Watch the intelligence surface. See the proof.",
    imageSrc: "/images/story-future.webp",
    imageAlt: "Call to action",
    icon: <IconTarget width="24" height="24" />,
  },
];

export default function V3GuidedStory() {
  const [currentStep, setCurrentStep] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStep(index);
      }
    },
    []
  );

  const next = useCallback(() => goTo(currentStep + 1), [currentStep, goTo]);
  const prev = useCallback(() => goTo(currentStep - 1), [currentStep, goTo]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          goTo(Math.min(currentStep + 1, steps.length - 1));
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goTo(Math.max(currentStep - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(steps.length - 1);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, goTo]);

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      <Header />

      <main className="story-container" role="main" aria-label="Guided story experience">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isEven = index % 2 === 1;

          return (
            <div
              key={index}
              className={`story-step ${isActive ? "active" : ""}`}
              aria-hidden={!isActive}
            >
              <div className="story-step-inner">
                {isEven ? (
                  <>
                    <div>
                      <ImageSection
                        src={step.imageSrc}
                        alt={step.imageAlt}
                        width={600}
                        height={400}
                      />
                    </div>
                    <div>
                      <div className="story-step-number">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {step.icon}
                          {step.label}
                        </span>
                      </div>
                      <h2 className="hero-title" style={{ marginBottom: "20px" }}>
                        {step.title}
                      </h2>
                      <p
                        className="hero-description"
                        style={{ marginBottom: index === steps.length - 1 ? "32px" : "0" }}
                      >
                        {step.description}
                      </p>
                      {index === steps.length - 1 && (
                        <div className="hero-actions">
                          <CTAButton href="/v3" variant="primary">
                            Start Your Validation
                          </CTAButton>
                          <CTAButton href="/v1" variant="secondary">
                            Learn More
                          </CTAButton>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="story-step-number">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {step.icon}
                          {step.label}
                        </span>
                      </div>
                      <h2 className="hero-title" style={{ marginBottom: "20px" }}>
                        {step.title}
                      </h2>
                      <p
                        className="hero-description"
                        style={{ marginBottom: index === steps.length - 1 ? "32px" : "0" }}
                      >
                        {step.description}
                      </p>
                      {index === steps.length - 1 && (
                        <div className="hero-actions">
                          <CTAButton href="/v3" variant="primary">
                            Start Your Validation
                          </CTAButton>
                          <CTAButton href="/v1" variant="secondary">
                            Learn More
                          </CTAButton>
                        </div>
                      )}
                    </div>
                    <div>
                      <ImageSection
                        src={step.imageSrc}
                        alt={step.imageAlt}
                        width={600}
                        height={400}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Story dots navigation */}
        <nav
          className="story-dots"
          aria-label="Story navigation"
          role="tablist"
        >
          {steps.map((step, index) => (
            <button
              key={index}
              className={`story-dot ${index === currentStep ? "active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`${step.label}: ${step.title}`}
              aria-selected={index === currentStep}
              role="tab"
              title={step.title}
            />
          ))}
        </nav>

        {/* Story controls */}
        <div className="story-controls">
          <button
            className="story-btn"
            onClick={prev}
            disabled={isFirstStep}
            aria-label="Previous chapter"
          >
            Back
          </button>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              color: "var(--color-text-muted)",
              fontWeight: 500,
              minWidth: "60px",
              justifyContent: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {currentStep + 1} / {steps.length}
          </span>
          <button
            className="story-btn"
            onClick={next}
            disabled={isLastStep}
            aria-label="Next chapter"
          >
            Next
          </button>
        </div>
      </main>
    </>
  );
}
