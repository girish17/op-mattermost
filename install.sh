#!/bin/bash

# op-mattermost one-line install script
# Usage: ./install.sh [OPTIONS]
# Options can be passed as environment variables or flags

set -e

# Default values
DEFAULT_OP_URL="http://openproject:8080/api/v3"
DEFAULT_INT_URL="http://web:3000"
DEFAULT_MM_URL="http://mattermost:8065/api/v4"
DEFAULT_LOGO_URL="http://web:3000/getLogo"

# Function to print usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  --op-url URL          OpenProject API URL (default: $DEFAULT_OP_URL)"
    echo "  --int-url URL         Integration Service URL (default: $DEFAULT_INT_URL)"
    echo "  --mm-url URL          Mattermost API URL (default: $DEFAULT_MM_URL)"
    echo "  --logo-url URL        Logo URL (default: $DEFAULT_LOGO_URL)"
    echo "  --mm-slash-token TOKEN Mattermost Slash Command Token"
    echo "  --mm-bot-token TOKEN   Mattermost Bot Token"
    echo "  --op-token TOKEN       OpenProject Access Token"
    echo "  --help                 Show this help message"
    echo ""
    echo "Environment variables are also accepted:"
    echo "  OP_URL, INT_URL, MM_URL, LOGO_URL"
    echo "  MATTERMOST_SLASH_TOKEN, MATTERMOST_BOT_TOKEN, OP_ACCESS_TOKEN"
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --op-url) OP_URL="$2"; shift ;;
        --int-url) INT_URL="$2"; shift ;;
        --mm-url) MM_URL="$2"; shift ;;
        --logo-url) LOGO_URL="$2"; shift ;;
        --mm-slash-token) MATTERMOST_SLASH_TOKEN="$2"; shift ;;
        --mm-bot-token) MATTERMOST_BOT_TOKEN="$2"; shift ;;
        --op-token) OP_ACCESS_TOKEN="$2"; shift ;;
        --help) usage; exit 0 ;;
        *) echo "Unknown parameter passed: $1"; usage; exit 1 ;;
    esac
    shift
done

# Set defaults if not provided
OP_URL=${OP_URL:-$DEFAULT_OP_URL}
INT_URL=${INT_URL:-$DEFAULT_INT_URL}
MM_URL=${MM_URL:-$DEFAULT_MM_URL}
LOGO_URL=${LOGO_URL:-$DEFAULT_LOGO_URL}
MATTERMOST_SLASH_TOKEN=${MATTERMOST_SLASH_TOKEN:-"CHANGE_ME"}
MATTERMOST_BOT_TOKEN=${MATTERMOST_BOT_TOKEN:-"CHANGE_ME"}
OP_ACCESS_TOKEN=${OP_ACCESS_TOKEN:-"CHANGE_ME"}

echo "----------------------------------------------------------------"
echo "Starting op-mattermost installation..."
echo "----------------------------------------------------------------"

# Create .env file
echo "Generating .env file..."
cat > .env <<EOF
OP_URL=$OP_URL
INT_URL=$INT_URL
MM_URL=$MM_URL
LOGO_URL=$LOGO_URL
MATTERMOST_SLASH_TOKEN=$MATTERMOST_SLASH_TOKEN
MATTERMOST_BOT_TOKEN=$MATTERMOST_BOT_TOKEN
OP_ACCESS_TOKEN=$OP_ACCESS_TOKEN
EOF

echo ".env file created with the following configuration:"
echo "  OP_URL: $OP_URL"
echo "  INT_URL: $INT_URL"
echo "  MM_URL: $MM_URL"
echo "  LOGO_URL: $LOGO_URL"
if [ "$MATTERMOST_SLASH_TOKEN" == "CHANGE_ME" ]; then
    echo "  MATTERMOST_SLASH_TOKEN: [NOT SET - Please update .env later]"
else
    echo "  MATTERMOST_SLASH_TOKEN: [SET]"
fi

if [ "$MATTERMOST_BOT_TOKEN" == "CHANGE_ME" ]; then
    echo "  MATTERMOST_BOT_TOKEN: [NOT SET - Please update .env later]"
else
    echo "  MATTERMOST_BOT_TOKEN: [SET]"
fi

if [ "$OP_ACCESS_TOKEN" == "CHANGE_ME" ]; then
    echo "  OP_ACCESS_TOKEN: [NOT SET - Please update .env later]"
else
    echo "  OP_ACCESS_TOKEN: [SET]"
fi

# Check for docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "Error: docker-compose or 'docker compose' is not installed."
    exit 1
fi

echo "Building and starting containers using $DOCKER_COMPOSE_CMD..."
$DOCKER_COMPOSE_CMD up -d --build

echo "----------------------------------------------------------------"
echo "Installation complete!"
echo "Services are running."
echo ""
echo "If you haven't set the tokens yet, please edit the .env file:"
echo "  1. Open .env"
echo "  2. Update MATTERMOST_SLASH_TOKEN, MATTERMOST_BOT_TOKEN, and OP_ACCESS_TOKEN"
echo "  3. Restart the service: $DOCKER_COMPOSE_CMD restart web"
echo "----------------------------------------------------------------"
