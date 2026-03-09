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
