# HDIM Public Launch Readiness — Design Document

**Date:** 2026-03-09
**Scope:** hdim-master, hdim-validation, hdim-accelerator
**License:** BSL 1.1 (Licensor: Grateful House Inc.)
**Approach:** Full Parity — all three repos launch-ready simultaneously

## Context

Three repositories form the HDIM ecosystem, launching publicly under BSL 1.1:

| Repository | Purpose | Current State |
|------------|---------|---------------|
| `hdim` (hdim-master) | Core platform — 51 Java + 2 Python services, API, landing page | Launch-ready (LICENSE, NOTICE, compliance docs, CI/CD) |
| `hdim-validation` | Validation demo — proves platform with synthetic FHIR R4 data | Needs LICENSE, README rewrite, repo hygiene |
| `hdim-accelerator` | Provider starter toolkit — workflow integration templates and portal | Needs LICENSE, README, major cleanup |

All repos will live under the `mahoosuc-solutions` GitHub org.

## Section 1: Repository Hygiene

### hdim-validation
- Remove `firebase-debug.log` from tracking
- Add to `.gitignore`: `.env`, `.env.local`, `.env.*.local`, `firebase-debug.log`
- Rename default branch `master` → `main`

### hdim-accelerator
- Remove Windows lighthouse cache dirs (`C:\Users\aaron\AppData\...`)
- Remove committed PNG screenshots from root
- Remove `firebase-debug.log`
- Clean `.env.local` from history
- Add comprehensive `.gitignore` (modeled on hdim-master)
- Rename default branch `master` → `main`

### hdim-master
- Verify `.env*` files are not tracked (gitignored but present on disk)
- Align local branch to `main` (remote already has `main`)

## Section 2: Licensing & Legal

BSL LICENSE file for hdim-validation and hdim-accelerator:

| Parameter | hdim-validation | hdim-accelerator |
|-----------|-----------------|------------------|
| Licensor | Grateful House Inc. | Grateful House Inc. |
| Licensed Work | HDIM Validation demo app and source code | HDIM Accelerator starter toolkit and source code |
| Published at | `https://github.com/mahoosuc-solutions/hdim-validation` | `https://github.com/mahoosuc-solutions/hdim-accelerator` |
| Additional Use Grant | Non-production eval/research/testing/demo | Non-production eval/research/testing/demo |
| Change Date | 2030-03-07 | 2030-03-07 |
| Change License | Apache License 2.0 | Apache License 2.0 |

NOTICE file for each, referencing LICENSE and linking to hdim-master compliance docs.

No separate THIRD_PARTY_NOTICES needed for satellite repos.

## Section 3: READMEs

### hdim-validation — rewrite
- BSL, FHIR R4, Angular, Docker badges
- Description: what it is, relationship to hdim-master
- Architecture overview (7 routes, what each proves)
- Synthetic patient phenotypes table
- Prerequisites (requires running hdim-master backend)
- Local dev, build, deployment instructions
- Licensing section with cross-link to hdim-master compliance docs

### hdim-accelerator — create from scratch
- BSL, Next.js badges
- Description: starter toolkit for provider workflow integration
- What's included (portal app, hooks system)
- Relationship to hdim-master
- Getting started / quick start
- Licensing section

### hdim-master — minor updates
- Add "HDIM Ecosystem" section linking to sibling repos

## Section 4: Git & GitHub Setup

- Create `hdim-validation` repo under `mahoosuc-solutions`
- Create `hdim-accelerator` repo under `mahoosuc-solutions`
- All repos: default branch `main`
- hdim-validation: rename `master` → `main`, add remote, push
- hdim-accelerator: rename `master` → `main`, add remote, push
- hdim-master: align local `master` to `main`
- No CI/CD for satellite repos at initial launch
- No `.gitleaks.toml` for satellite repos initially

## Section 5: Cross-Repo Coherence

- Same Licensor and Change Date across all three
- READMEs cross-link in an "HDIM Ecosystem" table
- Satellite repos reference hdim-master `docs/compliance/` as canonical source
- No duplicated compliance docs

### Ecosystem table (added to all READMEs):

| Repository | Purpose |
|------------|---------|
| [hdim](https://github.com/mahoosuc-solutions/hdim) | Core platform — backend services, API, landing page |
| [hdim-validation](https://github.com/mahoosuc-solutions/hdim-validation) | Validation demo — proves platform capabilities with synthetic FHIR data |
| [hdim-accelerator](https://github.com/mahoosuc-solutions/hdim-accelerator) | Provider starter toolkit — workflow integration templates and portal |

## Implementation Order

1. Hygiene (clean all three repos)
2. Licensing (LICENSE + NOTICE files)
3. READMEs (rewrite/create)
4. GitHub setup (create repos, rename branches, push)
5. Cross-repo links (ecosystem table in all READMEs)
