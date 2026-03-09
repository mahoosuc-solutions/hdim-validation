# HDIM Validation

## Project Overview

Dual-codebase validation project for the [HDIM platform](https://github.com/mahoosuc-solutions/hdim):

- **Angular 21 demo app** (`src/`): Clinical data validation dashboard connecting to HDIM API Gateway
- **Next.js 16 marketing site** (`site/`): Public-facing site with DALL-E 3 generated imagery

## Architecture

### Angular App
- Standalone components (modern Angular pattern)
- HTTP interceptors: auth token injection, traffic inspection, error handling
- Services: TokenService, DemoSeedingService, QualityMeasureService
- D3.js for data visualization
- Material Design UI

### Marketing Site
- Next.js 16 with React 19
- Tailwind CSS 4
- OpenAI SDK for image generation
- Static export for deployment

## Common Tasks

### Run Angular app
```bash
npm install
npx ng serve
# Requires HDIM API Gateway on localhost:18080
```

### Run marketing site
```bash
cd site && npm install && npm run dev
```

### Build for production
```bash
npx ng build --configuration production  # Angular
cd site && npm run build                  # Next.js
```

### Docker build (Angular app)
```bash
docker build -t hdim-validation .
docker run -p 8080:8080 -e API_GATEWAY_URL=http://gateway:18080 hdim-validation
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/core/services/` | Angular services (auth, seeding, quality measures) |
| `src/app/features/` | 8 feature modules (seeding, pipeline, analytics, etc.) |
| `src/app/core/interceptors/` | HTTP interceptors |
| `site/src/app/` | Next.js pages |
| `Dockerfile` | Multi-stage Angular build + nginx |
| `nginx.conf` | SPA routing + security headers |
| `proxy.conf.json` | Dev proxy to API Gateway |
