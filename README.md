# op-mattermost ![Node.js CI](https://github.com/girish17/op-mattermost/workflows/Node.js%20CI/badge.svg)

[OpenProject](https://www.openproject.org/) and [Mattermost](https://mattermost.com/) integration to log time for a work package. This integration is built along the lines of [op-slack-connector](https://github.com/girish17/op-slack-connector)

## Dependencies

- OpenProject community edition
- Mattermost preview
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
- Node js
  - [Download and install](https://nodejs.org/en/download/)
  - Run `npm install` to install npm dependencies

## Development setup

- Fork and `git clone` the repo using HTTPS
- Install and launch all the dependencies as mentioned above and open the cloned directory in an editor or IDE of your choice
- Run `sh configure.sh` to create `.env` using bash command line. The entries in `.env` would contain following:
    - `OP_URL=http://<your host or ip address>:8080/api/v3/   #needed for pointing to OpenProject installation`
    - `INT_URL=http://<your host or ip address>:3000/         #needed for exposing the integration running on port 3000`
    - `MM_URL=http://<your host or ip address>:8065/api/v4/   #needed for pointing to Mattermost installation`  
    - `MATTERMOST_ACCESS_TOKEN=<personal access token>        #https://docs.mattermost.com/developer/personal-access-tokens.html`
    - `MATTERMOST_LOG_TIME_TOKEN=<use the mattermost slash command token for logtime>  #needed for slash command validation`
    - `MATTERMOST_GET_TIME_LOG_TOKEN=<use the mattermost slash command token for gettimelog>`
    - `OP_ACCESS_TOKEN=<openproject access token obtained from profile page>`
- In the project root directory do `npm init` to generate (or update existing) package.json file
- Then run `npm install` to download and install the node modules from npm
- Run op-mattermost in the console using `npm start` (usually launches on port 3000)
- Create a custom Mattermost slash command `/logtime` as described [here](https://docs.mattermost.com/developer/slash-commands.html) and provide local host or IP address (with port 3000) as the request URL
- Similarly, create `/gettimelog` slash command to fetch time logs
- In OpenProject, create a custom field `billable hours` for all workpackages in a project
- Test the integration by trying `/logtime 1` in the message bar, then try `/gettimelog`

## Demo

![Demo](resource/op-mattermost-demo.gif)

## COPYING

Copyright (C) 2020, 2019 Girish M

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
