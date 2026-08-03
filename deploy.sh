#!/usr/bin/env bash

###############################################################################
# Laravel Production Deployment Script
# Project : Scented Muse
# Server  : Truehost cPanel Shared Hosting
###############################################################################

set -e

PROJECT_PATH="/home/mlyycypz/Scented-Muse-Shop"
WEB_ROOT="/home/mlyycypz/public_html"
UPLOADS_PATH="${WEB_ROOT}/uploads"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

###############################################################################
# Error Handler
###############################################################################

on_error() {
    echo
    echo -e "${RED}====================================================${NC}"
    echo -e "${RED}Deployment failed!${NC}"
    echo -e "${RED}Failed command:${NC}"
    echo "  ${BASH_COMMAND}"
    echo -e "${RED}====================================================${NC}"
}

trap on_error ERR

###############################################################################
# Helper Functions
###############################################################################

step() {
    echo
    echo -e "${BLUE}==> $1${NC}"
}

success() {
    echo -e "${GREEN}$1${NC}"
}

fail() {
    echo
    echo -e "${RED}ERROR: $1${NC}"
    exit 1
}

###############################################################################
# Start Deployment
###############################################################################

step "Changing to project directory"

cd "$PROJECT_PATH"

###############################################################################
# Verify Project
###############################################################################

step "Verifying Laravel project"

[ -f artisan ] || fail "artisan file not found."

[ -f .env ] || fail ".env file not found."

###############################################################################
# Verify Required Commands
###############################################################################

step "Checking required commands"

command -v php >/dev/null 2>&1 || fail "PHP is not installed."

command -v composer >/dev/null 2>&1 || fail "Composer is not installed."

command -v git >/dev/null 2>&1 || fail "Git is not installed."

###############################################################################
# Git
###############################################################################

step "Checking current branch"

CURRENT_BRANCH=$(git branch --show-current)

echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    fail "Current branch is '$CURRENT_BRANCH'. Expected 'main'."
fi

###############################################################################
# Pull Latest Code
###############################################################################

step "Pulling latest code"

git pull origin main

###############################################################################
# Ensure Laravel Directories
###############################################################################

step "Ensuring required directories exist"

mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

###############################################################################
# Composer
###############################################################################

step "Installing Composer dependencies"

composer install --no-dev --optimize-autoloader

###############################################################################
# Database
###############################################################################

step "Running database migrations"

php artisan migrate --force

###############################################################################
# Verify Frontend Build
###############################################################################

step "Checking frontend build"

if [ ! -f public/build/manifest.json ]; then
    fail "public/build/manifest.json is missing.

Run:

npm run build

locally, commit public/build, push to GitHub, then deploy again."
fi

###############################################################################
# Clear Old Cache
###############################################################################

step "Clearing Laravel caches"

php artisan optimize:clear

###############################################################################
# Optimize Laravel
###############################################################################

step "Optimizing Laravel"

php artisan optimize

###############################################################################
# Upload Directories
###############################################################################

step "Creating upload directories"

mkdir -p "$UPLOADS_PATH"
mkdir -p "$UPLOADS_PATH/hero-slides"
mkdir -p "$UPLOADS_PATH/products"
mkdir -p "$UPLOADS_PATH/products/variants"

###############################################################################
# Permissions
###############################################################################

step "Setting permissions"

chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod -R 775 "$UPLOADS_PATH"

###############################################################################
# Publish Public Files
###############################################################################

step "Publishing public files"

mkdir -p "$WEB_ROOT"

cp -a public/. "$WEB_ROOT"/

###############################################################################
# Verify Deployment
###############################################################################

step "Verifying deployment"

[ -f "$WEB_ROOT/index.php" ] || fail "public_html/index.php was not copied."

###############################################################################
# Show Version
###############################################################################

step "Laravel version"

php artisan --version

###############################################################################
# Deployment Summary
###############################################################################

echo
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} Deployment completed successfully!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo "Project : Scented Muse"
echo "Branch  : $(git branch --show-current)"
echo "Commit  : $(git rev-parse --short HEAD)"
echo "Laravel : $(php artisan --version)"
echo "URL     : https://scentedmuse.co.ke"
echo -e "${GREEN}====================================================${NC}"