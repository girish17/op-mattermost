# Copyright (C) 2020, Girish M
# This is free and unencumbered software released into the public domain.
#
# Anyone is free to copy, modify, publish, use, compile, sell, or
# distribute this software, either in source code form or as a compiled
# binary, for any purpose, commercial or non-commercial, and by any
# means.
#
# In jurisdictions that recognize copyright laws, the author or authors
# of this software dedicate any and all copyright interest in the
# software to the public domain. We make this dedication for the benefit
# of the public at large and to the detriment of our heirs and
# successors. We intend this dedication to be an overt act of
# relinquishment in perpetuity of all present and future rights to this
# software under copyright law.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
# OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
# ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.
#
# For more information, please refer to <https://unlicense.org>
OK="n"

until [ $OK = "y" ]
do
    echo '\nPlease enter the following environment variables'
    read -p 'OP_URL (http://localhost:8080/api/v3): ' OP_URL
    if [ -z "$OP_URL" ]
    then
        OP_URL="http://localhost:8080/api/v3"
    fi
    read -p 'INT_URL (enter an http url obtained by running ngrok on 3000 port ): ' INT_URL
    read -p 'MM_URL (http://localhost:8065/api/v4): ' MM_URL
    if [ -z "$MM_URL" ]
    then
        MM_URL="http://localhost:8065/api/v4"
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
ENV_CONTENTS='OP_URL='$OP_URL'/\nINT_URL='$INT_URL'/\nMM_URL='$MM_URL'/\nMATTERMOST_ACCESS_TOKEN='$MATTERMOST_ACCESS_TOKEN'\nMATTERMOST_SLASH_TOKEN='$MATTERMOST_SLASH_TOKEN'\nOP_ACCESS_TOKEN='$OP_ACCESS_TOKEN

touch .env
echo $ENV_CONTENTS > .env
echo '\nDone.'
