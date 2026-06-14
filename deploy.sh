#!/usr/bin/env bash
# Portable one-shot deploy: install deps and run `pulumi up`.
# Prereqs: Pulumi CLI, `az login` (or ARM_* env vars), and Docker running.
set -euo pipefail
cd "$(dirname "$0")/infra"
npm install
pulumi up
