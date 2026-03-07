interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  level?: 1 | 2 | 3;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  level = 2,
}: SectionHeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <div className={`section-heading ${align}`}>
      <Tag className="section-title">{title}</Tag>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
