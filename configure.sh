# op-mattermost provides an integration for Mattermost and Open Project.
# Copyright (C) 2020 to present , Girish M

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>

OK="n"

until [ $OK = "y" ]; do
  echo '\nPlease enter host IP or name'
  read -rp 'HOST (default: localhost): ' HOST
  if [ -z "$HOST" ]; then
    HOST="localhost"
  fi
  echo '\nPlease enter the following environment variables'
  read -rp "OP_URL (http://$HOST:8080/api/v3): " OP_URL
  if [ -z "$OP_URL" ]; then
    OP_URL="http://$HOST:8080/api/v3"
  fi
  read -rp "INT_URL (http://$HOST:3000): " INT_URL
  if [ -z "$INT_URL" ]; then
    INT_URL="http://$HOST:3000"
  fi
  read -rp "MM_URL (http://$HOST:8065/api/v4): " MM_URL
  if [ -z "$MM_URL" ]; then
    MM_URL="http://$HOST:8065/api/v4"
  fi

  echo "\nPlease enter the generated access tokens for OpenProject and Mattermost"
  read -rp 'MATTERMOST_SLASH_TOKEN: ' MATTERMOST_SLASH_TOKEN
  read -rp 'MATTERMOST_BOT_TOKEN: ' MATTERMOST_BOT_TOKEN
  read -rp 'OP_ACCESS_TOKEN: ' OP_ACCESS_TOKEN

  echo '\nInput environment variables:\n'
  echo OP_URL=$OP_URL
  echo INT_URL=$INT_URL
  echo MM_URL=$MM_URL
  echo MATTERMOST_SLASH_TOKEN="$MATTERMOST_SLASH_TOKEN"
  echo MATTERMOST_BOT_TOKEN="$MATTERMOST_BOT_TOKEN"
  echo OP_ACCESS_TOKEN="$OP_ACCESS_TOKEN"

  read -rp 'Is this OK (y/n) ? ' OK
  if [ -z "$OK" ]; then
    OK="n"
  fi
done
echo '\nGenerating .env file...'
ENV_CONTENTS='OP_URL='$OP_URL'/\nINT_URL='$INT_URL'/\nMM_URL='$MM_URL'/\nMATTERMOST_SLASH_TOKEN='$MATTERMOST_SLASH_TOKEN'\nMATTERMOST_BOT_TOKEN='$MATTERMOST_BOT_TOKEN'\nOP_ACCESS_TOKEN='$OP_ACCESS_TOKEN

touch .env
echo "$ENV_CONTENTS" >.env
echo '\nDone.'