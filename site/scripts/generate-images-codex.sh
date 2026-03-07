#!/bin/bash
# Generate DALL-E 3 images for HDIM Validation site via Codex CLI
# Requires: OPENAI_API_KEY set in environment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "Error: OPENAI_API_KEY environment variable is required."
  exit 1
fi

codex exec --full-auto -C "$SITE_DIR" \
  "Run 'node scripts/generate-images.mjs' to generate all DALL-E 3 images. The OPENAI_API_KEY environment variable is already set."
