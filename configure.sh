#
# Created on Thu Dec 19 2019
#
# Copyright 2019 Girish M
#Licensed under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License.
#You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#Unless required by applicable law or agreed to in writing, software
#distributed under the License is distributed on an "AS IS" BASIS,
#WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#See the License for the specific language governing permissions and
#limitations under the License.
#
#! /bin/bash

OK="n"

until [ $OK = "y" ]
do
    echo '\nPlease enter the following environment variables. Note: URLs must end with /'
    read -p 'OP_URL (http://localhost:8080/api/v3/): ' OP_URL
    if [ -z "$OP_URL" ]
    then
        OP_URL="http://localhost:8080/api/v3/"
    fi
    read -p 'INT_URL (enter an http url obtained by running ngrok on 3000 port ): ' INT_URL
    read -p 'MM_URL (http://localhost:8065/api/v4/): ' MM_URL
    if [ -z "$MM_URL" ]
    then
        MM_URL="http://localhost:8065/api/v4/"
    fi

    echo "\nPlease enter the generated access tokens for OpenProject and Mattermost"
    read -p 'MATTERMOST_ACCESS_TOKEN: ' MATTERMOST_ACCESS_TOKEN
    read -p 'MATTERMOST_SLASH_TOKEN: ' MATTERMOST_SLASH_TOKEN
    read -p 'OP_ACCESS_TOKEN: ' OP_ACCESS_TOKEN

    echo '\nInput environment variables:\n'
    echo OP_URL=$OP_URL
    echo INT_URL=$INT_URL
    echo MM_URL=$MM_URL
    echo MATTERMOST_ACCESS_TOKEN=$MATTERMOST_ACCESS_TOKEN
    echo MATTERMOST_SLASH_TOKEN=$MATTERMOST_SLASH_TOKEN
    echo OP_ACCESS_TOKEN=$OP_ACCESS_TOKEN

    read -p 'Is this OK (y/n) ? ' OK
    if [ -z "$OK" ]
    then
        OK="n"
    fi
done
echo '\nGenerating .env file...'
ENV_CONTENTS='OP_URL='$OP_URL'\nINT_URL='$INT_URL'\nMM_URL='$MM_URL'\nMATTERMOST_ACCESS_TOKEN='$MATTERMOST_ACCESS_TOKEN'\nMATTERMOST_SLASH_TOKEN='$MATTERMOST_SLASH_TOKEN'\nOP_ACCESS_TOKEN='$OP_ACCESS_TOKEN

touch .env
echo $ENV_CONTENTS > .env
echo '\nDone.'