"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { AccessibilityMenu } from "./accessibility-menu";

interface HeaderProps {
  nav?: React.ReactNode;
}

export function Header({ nav }: HeaderProps) {
  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <Link href="/" className="header-brand" aria-label="HDIM Validation Home">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
            <path
              d="M8 11h4v10H8V11zm12 0h4v10h-4V11zm-8 4h8v2h-8v-2z"
              fill="white"
            />
          </svg>
          <span className="header-title">HDIM</span>
          <span className="header-subtitle">Validation Platform</span>
        </Link>

        {nav && <nav className="header-nav" aria-label="Main navigation">{nav}</nav>}

        <div className="header-actions">
          <AccessibilityMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
