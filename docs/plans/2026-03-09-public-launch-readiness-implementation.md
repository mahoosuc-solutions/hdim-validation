# HDIM Public Launch Readiness — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring hdim-validation to full parity with hdim-master for public BSL launch, verify hdim-accelerator and hdim-master are ready, and create GitHub repos.

**Architecture:** Three-repo ecosystem under `mahoosuc-solutions` GitHub org. hdim-master is the core platform (already launch-ready). hdim-validation and hdim-accelerator are satellite repos that reference hdim-master for compliance docs.

**Tech Stack:** Angular 21 (validation), Next.js (accelerator), Spring Boot/Java (master). BSL 1.1 licensing. GitHub hosting.

---

## Task 1: hdim-validation — Repository Hygiene

**Files:**
- Modify: `/mnt/wdblack/dev/projects/hdim-validation/.gitignore`
- Remove from tracking: `firebase-debug.log` (if tracked)

**Step 1: Update .gitignore**

Add the following entries to `.gitignore`:

```
# Environment files
.env
.env.*
.env*.local
!.env.example

# Firebase
firebase-debug.log
.firebase/

# Images (large binaries)
*.png
```

**Step 2: Remove firebase-debug.log from tracking if tracked**

Run: `git rm --cached firebase-debug.log 2>/dev/null || echo "not tracked"`

**Step 3: Verify no secrets are tracked**

Run: `git ls-files | xargs grep -l -E '(AIza|ghp_|sk-[a-zA-Z0-9]{20,}|AKIA)' 2>/dev/null || echo "clean"`
Expected: "clean"

**Step 4: Commit**

```bash
git add .gitignore
git rm --cached firebase-debug.log 2>/dev/null
git commit -m "chore: harden .gitignore for public launch"
```

---

## Task 2: hdim-validation — Add BSL LICENSE

**Files:**
- Create: `/mnt/wdblack/dev/projects/hdim-validation/LICENSE`

**Step 1: Create LICENSE file**

```
Business Source License 1.1

Parameters

Licensor:             Grateful House Inc.
Licensed Work:        HDIM Validation — demo application and source code
                      as published at https://github.com/mahoosuc-solutions/hdim-validation
Additional Use Grant: You may copy, modify, create derivative works, and use this
                      Licensed Work for non-production internal evaluation, research,
                      testing, and demonstration purposes.
                      Production use (including managed service delivery, hosted
                      operation, or external customer-facing deployment) requires
                      a separate commercial agreement with the Licensor.
Change Date:          2030-03-07
Change License:       Apache License, Version 2.0

Terms

The Licensor hereby grants you the right to copy, modify, create derivative works,
redistribute, and make non-production use of the Licensed Work. The Licensor does
not grant you the right to use the Licensed Work in production, except as allowed
by the Additional Use Grant above or a separate written commercial agreement.

For purposes of this license:
- "Production use" means operating the Licensed Work to deliver services or
  functionality to end users, customers, or external organizations.
- "Non-production use" includes local development, internal testing, evaluation,
  proofs of concept, and educational use.

All copies of the Licensed Work, and all derivative works, must include this license.

THE LICENSED WORK IS PROVIDED ON AN "AS IS" BASIS. LICENSOR HEREBY DISCLAIMS ALL
WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND TITLE.

On or after the Change Date, this license will convert automatically to the
Change License for the Licensed Work, and each version of the Licensed Work
will be governed by the Change License once its own Change Date has passed.

This license text is based on the Business Source License 1.1 framework.
```

**Step 2: Create NOTICE file**

Create `/mnt/wdblack/dev/projects/hdim-validation/NOTICE`:

```
HDIM Validation
Copyright (c) Grateful House Inc.

This repository is licensed under the Business Source License 1.1 (BSL 1.1).
See LICENSE for the controlling terms.

Part of the HDIM ecosystem:
- https://github.com/mahoosuc-solutions/hdim (core platform)
- https://github.com/mahoosuc-solutions/hdim-accelerator (provider toolkit)

For compliance documentation, see the core platform repository:
- docs/compliance/BSL_RELEASE_PLAN.md
- docs/compliance/LICENSING-BOUNDARY.md
- docs/compliance/THIRD_PARTY_NOTICES.md

This NOTICE is informational. If there is any conflict between this file and
LICENSE, the LICENSE file governs.
```

**Step 3: Commit**

```bash
git add LICENSE NOTICE
git commit -m "chore: add BSL 1.1 license and NOTICE for public launch"
```

---

## Task 3: hdim-validation — Rewrite README

**Files:**
- Modify: `/mnt/wdblack/dev/projects/hdim-validation/README.md`

**Step 1: Replace README.md with public-facing version**

```markdown
# HDIM Validation

[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
[![FHIR R4](https://img.shields.io/badge/FHIR-R4-orange)](https://www.hl7.org/fhir/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)

> Validation demo for the [HealthData-in-Motion (HDIM)](https://github.com/mahoosuc-solutions/hdim) platform. Proves clinical data ingestion, validation, and analytics capabilities using synthetic FHIR R4 patient data against a live HDIM backend.

## What This Proves

| Route | Capability |
|-------|------------|
| `/seeding` | FHIR R4 bundle ingestion — 6 synthetic patients with distinct phenotypes |
| `/pipeline` | Real-time pipeline visualization via WebSocket event streaming |
| `/analytics` | Patient-level clinical analytics — risk stratification, care gaps, conditions |
| `/lifecycle` | Phenotype validation against expected clinical outcomes |
| `/security` | Security posture, HIPAA compliance status, audit log viewer |
| `/performance` | Platform performance metrics and health checks |
| `/operations` | Operational dashboard and system status |
| `/traffic` | HTTP traffic inspector with request/response diagnostics |

## Synthetic Patient Phenotypes

| Phenotype | MRN | Purpose |
|-----------|-----|---------|
| T2DM Managed | SYN-T2DM-M-001 | Controlled chronic disease with compliant care plan |
| T2DM Unmanaged | SYN-T2DM-U-002 | Uncontrolled diabetes triggering care gap detection |
| CHF Polypharmacy | SYN-CHF-P-003 | Heart failure with drug interaction risk analysis |
| Preventive Gaps | SYN-PG-004 | Missing screenings and immunizations |
| Healthy Pediatric | SYN-PED-H-005 | Baseline healthy patient for false-positive testing |
| Multi-Chronic Elderly | SYN-MCE-006 | Complex comorbidities with high risk stratification |

FHIR R4 bundles: `src/assets/patient-bundles/`. Expected outcomes: `src/assets/manifest.json`.

## Prerequisites

- Node.js 20+
- A running [HDIM platform](https://github.com/mahoosuc-solutions/hdim) backend on `localhost:18080` (or update `proxy.conf.json`)

## Local Development

```bash
npm install
npx ng serve
```

Dev server starts at `http://localhost:4200` with API requests proxied to the HDIM backend.

## Build

```bash
# Development
npx ng build --configuration development

# Production (uses environment.prod.ts)
npx ng build --configuration production
```

## Deployment (Cloud Run)

```bash
gcloud run deploy hdim-validation \
  --source . \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated
```

## HDIM Ecosystem

| Repository | Purpose |
|------------|---------|
| [hdim](https://github.com/mahoosuc-solutions/hdim) | Core platform — backend services, API, landing page |
| **hdim-validation** (this repo) | Validation demo — proves platform capabilities with synthetic FHIR data |
| [hdim-accelerator](https://github.com/mahoosuc-solutions/hdim-accelerator) | Provider starter toolkit — workflow integration templates and portal |

## License

Business Source License 1.1 — see [LICENSE](LICENSE).

Non-production use (development, testing, evaluation, education) is permitted. Production use requires a commercial agreement with [Grateful House Inc.](https://gratefulhouse.com)

For compliance documentation, see the [core platform repository](https://github.com/mahoosuc-solutions/hdim/tree/main/docs/compliance).
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for public BSL launch"
```

---

## Task 4: hdim-validation — Update package.json version

**Files:**
- Modify: `/mnt/wdblack/dev/projects/hdim-validation/package.json`

**Step 1: Set version to 1.0.0 and remove private flag**

Change `"version": "0.0.0"` to `"version": "1.0.0"`.
Remove `"private": true` line.

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: set version 1.0.0 for public launch"
```

---

## Task 5: hdim-validation — Rename branch and create GitHub repo

**Step 1: Rename branch**

```bash
cd /mnt/wdblack/dev/projects/hdim-validation
git branch -m master main
```

**Step 2: Create GitHub repo**

```bash
gh repo create mahoosuc-solutions/hdim-validation \
  --public \
  --description "Validation demo for the HealthData-in-Motion (HDIM) platform — synthetic FHIR R4 patients, pipeline visualization, clinical analytics" \
  --source . \
  --remote origin \
  --push
```

**Step 3: Verify**

Run: `gh repo view mahoosuc-solutions/hdim-validation`
Expected: repo exists, BSL license detected, README rendered

---

## Task 6: hdim-accelerator — Clean untracked files and rename branch

**Prerequisite:** hdim-accelerator already has LICENSE, README, .gitignore, and clean tracked history.

**Step 1: Remove untracked PNGs and junk from working directory**

```bash
cd /mnt/wdblack/dev/projects/hdim-accelerator
rm -f *.png
rm -rf "C:\Users\aaron\AppData"*
rm -f firebase-debug.log
```

**Step 2: Decide on portal/ directory**

The `portal/` dir (829MB untracked, contains `.git` subdir) is a separate Next.js app. Either:
- Add `portal/` to `.gitignore` if it's deployed separately
- Or add as a git submodule if it should be part of the accelerator

Ask user which approach. Default: add to `.gitignore`.

**Step 3: Rename branch**

```bash
git branch -m master main
```

**Step 4: Create GitHub repo**

```bash
gh repo create mahoosuc-solutions/hdim-accelerator \
  --public \
  --description "Provider starter toolkit for the HealthData-in-Motion (HDIM) platform — workflow integration, Claude Code plugin, reference portal" \
  --source . \
  --remote origin \
  --push
```

**Step 5: Verify**

Run: `gh repo view mahoosuc-solutions/hdim-accelerator`

---

## Task 7: hdim-master — Add ecosystem section to README

**Files:**
- Modify: `/mnt/wdblack/dev/projects/hdim-master/README.md`

**Step 1: Add ecosystem table**

After the "Go-to-Market" section, add:

```markdown
## HDIM Ecosystem

| Repository | Purpose |
|------------|---------|
| **hdim** (this repo) | Core platform — backend services, API, landing page |
| [hdim-validation](https://github.com/mahoosuc-solutions/hdim-validation) | Validation demo — proves platform capabilities with synthetic FHIR data |
| [hdim-accelerator](https://github.com/mahoosuc-solutions/hdim-accelerator) | Provider starter toolkit — workflow integration templates and portal |
```

**Step 2: Commit and push**

```bash
cd /mnt/wdblack/dev/projects/hdim-master
git add README.md
git commit -m "docs: add HDIM Ecosystem section with sibling repo links"
git push origin main
```

---

## Task 8: hdim-master — Clean up stale local branches

**Step 1: Delete local `master` branch if it's just a copy of `main`**

```bash
cd /mnt/wdblack/dev/projects/hdim-master
git branch -d master 2>/dev/null || echo "already on main or not exists"
```

**Step 2: Prune stale remote tracking branches**

```bash
git remote prune origin
git remote prune mahoosuc
```

---

## Task 9: Final verification across all three repos

**Step 1: Verify each repo has required files**

For each of hdim-master, hdim-validation, hdim-accelerator:
- [ ] LICENSE exists and mentions "Grateful House Inc."
- [ ] README.md has BSL badge and ecosystem table
- [ ] .gitignore covers .env*, *.log, node_modules, build output
- [ ] No secrets in tracked files
- [ ] Default branch is `main`
- [ ] GitHub repo is public and accessible

**Step 2: Cross-repo link verification**

- [ ] Each README links to the other two repos
- [ ] All GitHub URLs resolve correctly

**Step 3: Build verification (hdim-validation)**

```bash
cd /mnt/wdblack/dev/projects/hdim-validation
npx ng build --configuration development
```
Expected: Build succeeds
