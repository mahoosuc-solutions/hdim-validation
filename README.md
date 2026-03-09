[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)

# HDIM Validation

## What This Is

HDIM Validation is the public-facing proof that the [HDIM platform](https://github.com/mahoosuc-solutions/hdim) works. It consists of two codebases:

- **Angular 21 demo app** (`src/`) — a clinical data validation dashboard that connects to a live HDIM backend via API Gateway. No mocks, no simulation.
- **Next.js 16 marketing site** (`site/`) — public website with DALL-E 3 generated imagery showcasing HDIM capabilities.

## Relationship to HDIM

This repository validates the [hdim](https://github.com/mahoosuc-solutions/hdim) monorepo — a healthcare data integration and management platform with 38+ Java microservices, FHIR R4 ingestion, CQL evaluation, and quality measure reporting. HDIM Validation exercises the platform end-to-end with synthetic patient data and real API calls.

---

Standalone Angular demo app for the HIMS conference, showcasing the HDIM platform's clinical data ingestion, validation, and analytics capabilities. Connects to a live HDIM backend via GCP API Gateway — no simulation.

## Routes

| Route | Feature |
|-------|---------|
| `/seeding` | Seed 6 synthetic FHIR R4 patient bundles into the platform |
| `/pipeline` | Real-time pipeline visualization via WebSocket events |
| `/analytics` | Patient-level clinical analytics (risk, care gaps, conditions) |
| `/lifecycle` | Phenotype validation against expected outcomes |
| `/security` | Security posture, compliance status, and audit log viewer |
| `/performance` | Platform performance metrics and health checks |
| `/operations` | Operational dashboard and system status |
| `/traffic` | HTTP traffic inspector with request/response diagnostics |

## Synthetic Patient Phenotypes

| Phenotype | MRN |
|-----------|-----|
| T2DM Managed | SYN-T2DM-M-001 |
| T2DM Unmanaged | SYN-T2DM-U-002 |
| CHF Polypharmacy | SYN-CHF-P-003 |
| Preventive Gaps | SYN-PG-004 |
| Healthy Pediatric | SYN-PED-H-005 |
| Multi-Chronic Elderly | SYN-MCE-006 |

FHIR R4 bundles are in `src/assets/patient-bundles/`. Expected validation outcomes are defined in `src/assets/manifest.json`.

## Local Development

### Prerequisites

- Node.js 20+
- HDIM API Gateway running on `localhost:18080` (or update `proxy.conf.json`)

### Setup

```bash
npm install
npx ng serve
```

The dev server starts at `http://localhost:4200` with a proxy forwarding API requests to `localhost:18080`.

### Backend Endpoints Required

- REST API: Patient, Condition, Observation, MedicationRequest, Encounter (FHIR R4)
- REST API: Quality measures (risk stratification, care gaps)
- REST API: Audit logs, compliance status, health checks
- WebSocket: `/ws/evaluation-progress` for pipeline events

## Build

```bash
# Development (with source maps, proxy support)
npx ng build --configuration development

# Production (optimized, uses environment.prod.ts)
npx ng build --configuration production
```

## Deployment (Cloud Run)

Update the API Gateway URL in `src/environments/environment.prod.ts` before deploying.

```bash
# Build and deploy to Cloud Run
gcloud run deploy hdim-validation \
  --source . \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated
```

This builds the Docker image via Cloud Build and deploys it to Cloud Run. The nginx container serves the production Angular build with SPA routing and security headers.

---

## License

This project is licensed under the [Business Source License 1.1](LICENSE). See the LICENSE file for details.

Copyright Grateful House Inc.
