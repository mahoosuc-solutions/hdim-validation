import Link from "next/link";

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export function CTAButton({
  children,
  href,
  variant = "primary",
  onClick,
}: CTAButtonProps) {
  const className = `cta-button ${variant}`;

  if (href) {
    // Use native <a> for anchor links (#), Next.js <Link> for routes
    if (href.startsWith("#") || href.startsWith("mailto:")) {
      return (
        <a href={href} className={className}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
