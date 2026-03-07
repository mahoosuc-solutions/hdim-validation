# HDIM Validation Marketing Site — Design Document

## Purpose

A public-facing Vercel site that tells the story of the HDIM validation platform to non-technical healthcare stakeholders (CIOs, compliance officers, health IT directors). The site demonstrates that HDIM can accept any customer profile, generate synthetic patients matching that population, seed them into a live platform, and surface clinical intelligence in real time — care gaps discovered, risk scores calculated, and actionable insights delivered before the patient leaves the building.

## Brand

- **Tone:** Modern tech + warm healthcare
- **Theme:** OS-native light/dark mode via `prefers-color-scheme` + manual toggle, persisted to `localStorage`
- **Accessibility:** WCAG 2.1 AA — semantic HTML, ARIA, focus management, contrast ratios, keyboard nav, screen reader support
- **Imagery:** AI-generated visuals of patients and providers in clinical contexts, humanizing each use case
- **Typography:** Inter (body), Plus Jakarta Sans (headings)
- **Colors:**
  - Light: white bg, slate-700 text, cyan-600 primary, green-600 success, amber-500 warning
  - Dark: slate-950 bg, slate-100 text, cyan-400 primary, green-400 success, amber-400 warning

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS 4 with CSS custom properties
- `next/image` for optimized AI-generated imagery
- Deployed to Vercel as `hdim-validation`
- Project directory: `/mnt/wdblack/dev/projects/hdim-validation/site/`

## Three Versions (Feature Branches)

All branches share a common foundation on `main`: layout, theme system, accessibility utilities, shared components, color tokens.

---

### Version 1: Single-Page Scroll (`site/scroll-experience`)

One long-scroll page with 8 sections, each full-viewport height:

1. **Hero** — "See Your Patient Data Come Alive" + warm provider-patient image, CTA button
2. **Problem** — The gap between data and action in healthcare. Image: overwhelmed provider at desk
3. **Solution** — HDIM bridges that gap with real-time clinical intelligence. Image: provider with clear dashboard, confident
4. **How It Works** — 4-step visual flow: Profile > Synthesize > Populate > Monitor. Icons + brief copy per step
5. **Live Validation** — "We don't just claim it works — we prove it." Description of 6 phenotypes tested, validation results summary. Image: diverse patient group
6. **Use Cases** — 3 cards: Managed Diabetes, Preventive Care Gaps, Multi-Chronic Elderly. Each with patient image + outcome narrative
7. **Trust & Compliance** — HIPAA, WCAG, real-time audit trail, security posture. Image: compliance officer reviewing results
8. **CTA** — "Ready to see your population?" Contact/demo request form or link

**Navigation:** Floating top bar with section links, scroll-spy highlighting current section

---

### Version 2: Multi-Page Site (`site/multi-page`)

5 pages with persistent header navigation:

- **Home** (`/`) — Hero + value proposition + 3 feature highlights + CTA
- **Platform** (`/platform`) — Architecture overview, how data flows, the 4-step process, technology stack visual
- **Validation** (`/validation`) — The 6 phenotypes, what gets tested, how results are verified, trust evidence
- **Use Cases** (`/use-cases`) — 3 detailed use case stories with patient imagery, provider perspective, outcome
- **Contact** (`/contact`) — Demo request form, or link to scheduling

**Navigation:** Fixed header with logo + page links + theme toggle + accessibility menu

---

### Version 3: Guided Story (`site/guided-story`)

Step-through experience with 6 full-screen steps:

1. **"Meet Sarah"** — A provider starting her day. Image: provider arriving at clinic
2. **"Her Challenge"** — 200 patients, limited time, gaps hiding in data. Image: stacked charts, concerned expression
3. **"Enter HDIM"** — Customer profile plugged in, synthetic data generated. Image: elegant interface, data flowing
4. **"Watch It Happen"** — Real-time: patient arrives, data flows, care gap surfaces. Image: alert notification, provider reviewing
5. **"The Result"** — Gap caught before discharge. Better outcome. Image: patient-provider interaction, relief/confidence
6. **"Your Turn"** — CTA to request demo. Image: diverse healthcare team, forward-looking

**Navigation:** Progress dots on side, Next/Back buttons, keyboard arrow support. Can click any dot to jump. Smooth transitions between steps.

---

## Shared Components

| Component | Purpose |
|-----------|---------|
| `ThemeProvider` | OS detection, manual toggle, localStorage persistence, CSS variable injection |
| `ThemeToggle` | Sun/moon icon button with smooth transition |
| `AccessibilityMenu` | Font size adjustment, reduced motion toggle, high contrast option |
| `ImageSection` | AI image with next/image optimization, proper alt text, loading skeleton |
| `SectionHeading` | Consistent heading typography with optional subtitle |
| `CTAButton` | Primary action button with hover/focus states |
| `FeatureCard` | Icon + title + description card for feature highlights |
| `StepIndicator` | Numbered step with icon, used in "How It Works" sections |
| `SkipLink` | "Skip to main content" for keyboard/screen reader users |

## AI Image Prompts (To Generate)

Each image will be generated with prompts appropriate for warm, modern healthcare contexts:

1. **Hero:** Provider and patient in modern clinic, warm lighting, diverse
2. **Problem:** Provider at desk with multiple screens, slightly overwhelmed but professional
3. **Solution:** Same provider, now with clear single-screen insight, confident expression
4. **Patients (6):** Diverse synthetic patient representations matching phenotype demographics
5. **Compliance:** Professional reviewing audit dashboard, secure environment
6. **Team:** Diverse healthcare team collaborating, forward-looking

Images generated as 1920x1080 WebP, with 640px and 1280px responsive variants.

## Accessibility Checklist

- [ ] All images have descriptive alt text
- [ ] Color contrast ratios >= 4.5:1 (text) and 3:1 (UI elements)
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip navigation link present
- [ ] Semantic heading hierarchy (h1 > h2 > h3)
- [ ] ARIA landmarks: banner, navigation, main, contentinfo
- [ ] Keyboard navigable: tab order, enter/space activation, escape to close
- [ ] Reduced motion: `prefers-reduced-motion` respected for all animations
- [ ] Screen reader tested: meaningful content order, live regions for dynamic content
- [ ] Form inputs have associated labels
- [ ] Touch targets >= 44x44px

## File Structure

```
site/
  app/
    layout.tsx              # Root layout with ThemeProvider, SkipLink, metadata
    globals.css             # Tailwind imports, CSS custom properties, theme variables
    page.tsx                # Version-specific (changes per branch)
    platform/page.tsx       # V2 only
    validation/page.tsx     # V2 only
    use-cases/page.tsx      # V2 only
    contact/page.tsx        # V2 only
  components/
    theme-provider.tsx
    theme-toggle.tsx
    accessibility-menu.tsx
    header.tsx
    footer.tsx
    image-section.tsx
    section-heading.tsx
    cta-button.tsx
    feature-card.tsx
    step-indicator.tsx
    skip-link.tsx
    use-case-card.tsx       # V1 & V2
    story-step.tsx          # V3 only
    story-navigation.tsx    # V3 only
    scroll-spy-nav.tsx      # V1 only
  lib/
    theme.ts                # Theme constants, types
    accessibility.ts        # A11y utilities
  public/
    images/                 # AI-generated images
      hero.webp
      problem.webp
      solution.webp
      patients/
      compliance.webp
      team.webp
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

## Implementation Plan

### Phase 1: Foundation (shared across all versions)
1. Initialize Next.js 15 project in `site/` directory
2. Configure Tailwind CSS 4 with theme variables
3. Build ThemeProvider with OS detection + manual toggle
4. Build shared components: Header, Footer, ThemeToggle, SkipLink, AccessibilityMenu
5. Generate AI placeholder images (solid color with descriptive text overlays)
6. Set up accessibility foundations (ARIA landmarks, skip nav, focus styles)
7. Commit to main, push to Vercel

### Phase 2: Version 1 — Single-Page Scroll
1. Branch `site/scroll-experience`
2. Build all 8 sections as components
3. Add scroll-spy navigation
4. Add smooth scroll behavior (respecting reduced-motion)
5. Generate AI images for this version
6. Accessibility pass
7. Commit

### Phase 3: Version 2 — Multi-Page
1. Branch `site/multi-page` from main
2. Build 5 pages with shared layout
3. Add page navigation with active state
4. Generate AI images for this version
5. Accessibility pass
6. Commit

### Phase 4: Version 3 — Guided Story
1. Branch `site/guided-story` from main
2. Build step-through experience with transitions
3. Add progress dots, keyboard navigation
4. Generate AI images for this version
5. Accessibility pass
6. Commit

### Phase 5: Review
1. Serve all three locally for comparison
2. Evaluate, pick winner or keep all
