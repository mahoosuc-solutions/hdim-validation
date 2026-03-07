import { ImageSection } from "./image-section";

interface UseCaseCardProps {
  title: string;
  patient: string;
  scenario: string;
  outcome: string;
  imageSrc: string;
  imageAlt: string;
}

export function UseCaseCard({
  title,
  patient,
  scenario,
  outcome,
  imageSrc,
  imageAlt,
}: UseCaseCardProps) {
  return (
    <article className="use-case-card">
      <ImageSection src={imageSrc} alt={imageAlt} width={400} height={300} />
      <div className="use-case-content">
        <h3 className="use-case-title">{title}</h3>
        <div className="use-case-meta">
          <span className="use-case-patient">{patient}</span>
        </div>
        <p className="use-case-scenario">{scenario}</p>
        <div className="use-case-outcome">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{outcome}</span>
        </div>
      </div>
    </article>
  );
}
