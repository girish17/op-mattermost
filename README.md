# op-mattermost ![Node.js CI](https://github.com/girish17/op-mattermost/workflows/Node.js%20CI/badge.svg?branch=master)

[OpenProject](https://www.openproject.org/) and [Mattermost](https://mattermost.com/) integration to log time for a work package. This integration is built along the lines of [op-slack-connector](https://github.com/girish17/op-slack-connector)

## Dependencies

- OpenProject community edition
- Mattermost preview
- ngrok
- docker
- Node js and [npm modules](package.json)

## Installing dependencies

- Docker
  - [Download and install](https://docs.docker.com/install/) instructions
- OpenProject
  - Quick install
    - `docker run -it -p 8080:80 -e SECRET_KEY_BASE=secret openproject/community:latest` or
  - Recommended install
    - `sudo mkdir -p /var/lib/openproject/{pgdata, static}`
    - `docker run -d -p 8080:80 --name openproject -e SECRET_KEY_BASE=secret 
       -v /var/lib/openproject/pgdata:/var/openproject/pgdata 
       -v /var/lib/openproject/static:/var/openproject/assets 
       openproject/community:latest`
    - `docker stop openproject`
    - `docker start openproject`
- Mattermost
  - `docker run --name mattermost-preview -d --publish 8065:8065 --add-host dockerhost:127.0.0.1 mattermost/mattermost-preview`
- ngrok
  - [Download and install](https://ngrok.com/download)
  - Run `./ngrok http 3000`
- Node js
  - [Download and install](https://nodejs.org/en/download/)
  - Run `npm install` to install npm dependencies

## Development setup

- Fork and `git clone` the repo using HTTPS
- Install and launch all the dependencies as mentioned above and open the cloned directory in an editor or IDE of your choice
- Run `sh configure.sh` to create `.env` using bash command line. The entries in `.env` would contain following:
    - `OP_URL=http://<your host or ip address>:8080/api/v3/    #needed for pointing to OpenProject installation`
    - `INT_URL=<ngrok url>/                                   #needed for exposing the integration running on port 3000`
    - `MM_URL=http://<your host or ip address>:8065/api/v4/    #needed for pointing to Mattermost installation`  
    - `MATTERMOST_ACCESS_TOKEN=<personal access token>        # https://docs.mattermost.com/developer/personal-access-tokens.html`
    - `MATTERMOST_SLASH_TOKEN=<use the mattermost slash command token>  #needed for slash command validation`
    - `OP_ACCESS_TOKEN=<openproject access token obtained from profile page>`
- In the project root directory do `npm init` to generate (or update existing) package.json file
- Then run `npm install` to download and install the node modules from npm
- Run op-mattermost in the console using `npm start` (usually launches on port 3000)
- Run `ngrok http 3000` to get a public IP address (this will be the request URL for op-mattermost integration)
- Create a custom Mattermost slash command `/logtime` as described [here](https://docs.mattermost.com/developer/slash-commands.html) amd provide the ngrok IP address as the request URL
- Test the integration by trying `/logtime 1` in the message bar

## Demo

![Demo](resource/op-mattermost-demo.gif)

## Licence

Copyright (C) 2020, Girish M
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
