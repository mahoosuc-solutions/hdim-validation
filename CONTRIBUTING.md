# Contributing to HDIM Validation

Thank you for your interest in contributing to HDIM Validation.

## Getting Started

### Angular Demo App

```bash
npm install
npx ng serve
```

Runs at [http://localhost:4200](http://localhost:4200). Requires HDIM API Gateway on `localhost:18080`.

### Marketing Site

```bash
cd site
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Pull Request Workflow

1. Create a focused branch from `main`.
2. Run `npx ng build` to verify the Angular app builds.
3. Run `npm run build` in `site/` to verify the marketing site builds.
4. Describe the change and its motivation in the PR description.

## License

By contributing, you agree that your contributions will be licensed under the [BSL 1.1](LICENSE).
