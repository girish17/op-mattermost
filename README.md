# op-mattermost      ![Node.js CI](https://github.com/girish17/op-mattermost/workflows/Node.js%20CI/badge.svg)

[OpenProject](https://www.openproject.org/) integration for [Mattermost](https://mattermost.com/). Currently, supports following operations using a slash command -
- Create time entry for a work package
- Create work package for a project
- Delete work package
- View time logs
- Delete time log
- Subscribe to OpenProject notifications in Mattermost channel

## Demo

![Demo video](resource/op-mattermost-demo-v0.7.gif) recorded using [Peek](https://github.com/phw/peek).

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
    - `docker run -it -p 8080:80 -e SECRET_KEY_BASE=secret openproject/community:11` or
  - Recommended install
    - `sudo mkdir -p /var/lib/openproject/{pgdata, static}`
    - `docker run -d -p 8080:80 --name openproject -e SECRET_KEY_BASE=secret 
       -v /var/lib/openproject/pgdata:/var/openproject/pgdata 
       -v /var/lib/openproject/static:/var/openproject/assets
       openproject/community:11`
    - `docker stop openproject`
    - `docker start openproject`
  - For up to date info on OpenProject installation refer their [official docs](https://docs.openproject.org/installation-and-operations/installation/docker).
- Mattermost
  - `docker run --name mattermost-preview -d --publish 8065:8065 --add-host dockerhost:127.0.0.1 mattermost/mattermost-preview`
- Node js
  - [Download and install](https://nodejs.org/en/download/)
  - Run `npm install` to install npm dependencies

## Setup

- Fork and `git clone` the repo using HTTPS
- Install and launch all the dependencies as mentioned above and open the cloned directory in an editor or IDE of your choice
- Run `sh configure.sh` to create `.env` using bash command line. Alternatively, create a `.env` file using a text editor with the following entries:
    - `OP_URL=http://<your host or ip address>:8080/api/v3/`   (needed for pointing to OpenProject installation)
    - `INT_URL=http://<your host or ip address>:3000/`         (needed for exposing the integration running on port 3000)
    - `MM_URL=http://<your host or ip address>:8065/api/v4/`   (needed for pointing to Mattermost installation)
    - `MATTERMOST_SLASH_TOKEN=<use the mattermost slash command token for logtime>` (needed for slash command validation)
    - `MATTERMOST_BOT_TOKEN=<use the mattermost bot access token>`  (needed for validation for posting messages as bot)
    - `OP_ACCESS_TOKEN=<openproject access token (a.k.a apikey) obtained from user account page>`
- In the project root directory do `npm init` to generate (or update existing) `package.json` file
- Then run `npm install` to download and install the node modules from npm
- Run op-mattermost in the console using `npm start` (usually launches on port 3000)
- Create a custom Mattermost slash command `/op` as described [here](https://developers.mattermost.com/integrate/slash-commands/custom/) and provide localhost or IP address (with port 3000) as the request URL and method as `POST`
- Create a bot account with *System Admin* access as described [here](https://developers.mattermost.com/integrate/reference/bot-accounts/#bot-account-creation) 
- In OpenProject, create a custom field `billable hours` for all work packages in a project
- Test the integration by trying `/op` in the message bar.
- In case of error while invoking `/op` command:
  - Check the Developer console for errors
  - If the error is related `AllowedUntrustedInternalConnections` for the integration then
    - Go to `System Console` of Mattermost
    - Provide the integration URL in `Allow untrusted internal connections to`
    - Save it and retry. 

## Slash Command list

- `/op` - Displays the general menu
- `/op lt` - Log time for a work package
- `/op cwp` - Create a work package for a project
- `/op tl` - View time logs of the current user
- `/op dwp` - Delete work package
- `/op dtl` - Delete time log entry
- `/op sub` - Subscribe to OpenProject notifications in Mattermost channel

## Wiki

Development wiki is available [here](https://github.com/girish17/op-mattermost/wiki). It contains the workflows, file description and miscellaneous information necessary for development.

## Plugin
A Mattermost plugin with limited features mentioned in this project is available [here](https://github.com/girish17/op-mm-plugin).

## Mirror repositories

This project is also available on following repositories (as an alternative to GitHub) on:
- Notabug.org at https://notabug.org/girishm/op-mattermost
- SourceHut at https://sr.ht/~girishm/op-mattermost/

## Sponsors
This project was sponsored by [OpenProject Foundation (OPF)](https://github.com/opf) and mentioned in [OpenProject integrations](https://www.openproject.org/docs/system-admin-guide/integrations/#mattermost).

## COPYING

![GPLv3 or later](resource/gplv3-or-later.png)

Copyright (C) 2019 to present, Girish M

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
