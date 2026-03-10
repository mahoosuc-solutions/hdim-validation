# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in HDIM Validation, please report it responsibly.

**Email:** [sales@mahoosuc.solutions](mailto:sales@mahoosuc.solutions)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Disclosure Timeline

- We will acknowledge receipt within **3 business days**
- We aim to provide an initial assessment within **10 business days**
- We follow a **90-day responsible disclosure** timeline

## Scope

**In scope:**
- Angular demo application (`src/`)
- Marketing site (`site/`)
- Docker configuration and deployment
- CI/CD pipeline configuration

**Out of scope:**
- Third-party dependencies (report upstream)
- The core [HDIM platform](https://github.com/mahoosuc-solutions/hdim) (report there)
- Social engineering attacks

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest on `main` | Yes |
| Older releases | No |

## Security Measures

This project uses:
- [Gitleaks](https://github.com/gitleaks/gitleaks) for secret scanning in CI
- Dependency auditing via `npm audit`
- Content Security Policy headers in nginx configuration
