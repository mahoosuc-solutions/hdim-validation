interface StepIndicatorProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function StepIndicator({
  number,
  title,
  description,
  icon,
}: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      <div className="step-number" aria-hidden="true">
        <span className="step-num-text">{number}</span>
        <div className="step-icon">{icon}</div>
      </div>
      <h3 className="step-title">{title}</h3>
      <p className="step-description">{description}</p>
    </div>
  );
}
