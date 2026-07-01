#!/usr/bin/env bash
set -euo pipefail

# Local Fly.io deploy helper for VinTrack.
# Use this when GitHub Actions is unavailable or when you need to deploy
# manually from a laptop.
#
# Usage:
#   bash scripts/deploy.sh staging
#   bash scripts/deploy.sh production

ENVIRONMENT="${1:-}"

if [[ -z "$ENVIRONMENT" ]]; then
  echo "Error: environment argument required."
  echo "Usage: bash scripts/deploy.sh {staging|production}"
  exit 1
fi

case "$ENVIRONMENT" in
  staging)
    CONFIG="fly/fly.stage.toml"
    EXPECTED_BRANCH="develop"
    ;;
  production)
    CONFIG="fly/fly.prod.toml"
    EXPECTED_BRANCH="main"
    ;;
  *)
    echo "Error: unknown environment '$ENVIRONMENT'. Use 'staging' or 'production'."
    exit 1
    ;;
esac

if ! command -v flyctl &> /dev/null; then
  echo "Error: flyctl is not installed. See https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi

if ! flyctl auth whoami &> /dev/null; then
  echo "Error: not authenticated with Fly.io. Run: flyctl auth login"
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
if [[ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  echo "Warning: you are on branch '$CURRENT_BRANCH', but $ENVIRONMENT deploys usually come from '$EXPECTED_BRANCH'."
  read -r -p "Continue anyway? [y/N] " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "Deploy cancelled."
    exit 0
  fi
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  echo "WARNING: You are about to deploy to PRODUCTION."
  read -r -p "Are you sure? [yes/no] " REPLY
  if [[ "$REPLY" != "yes" ]]; then
    echo "Deploy cancelled."
    exit 0
  fi
fi

echo "Deploying $ENVIRONMENT with config: $CONFIG"
flyctl deploy --config "$CONFIG"
