#! /bin/bash

OK="n"

until [ $OK = "y" ]
do
    echo '\nPlease enter the following environment variables. Note: URLs must end with /'
    read -p 'OP_URL (http://localhost:8080/): ' OP_URL
    if [ -z "$OP_URL" ]
    then
        OP_URL="http://localhost:8080/"
    fi
    read -p 'INT_URL (enter an http url obtained by running ngrok on 3000 port ): ' INT_URL
    read -p 'MM_URL (http://localhost:8065/): ' MM_URL
    if [ -z "$MM_URL" ]
    then
        MM_URL="http://localhost:8065/"
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
echo $ENV_CONTENTS > .env1 
echo '\nDone.'