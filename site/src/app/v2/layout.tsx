"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const navLinks = [
  { href: "/v2/platform", label: "Platform" },
  { href: "/v2/validation", label: "Validation" },
  { href: "/v2/use-cases", label: "Use Cases" },
  { href: "/v2/contact", label: "Contact" },
];

export default function V2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const nav = (
    <div className="page-nav">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <Header nav={nav} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
