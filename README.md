# op-mattermost

[OpenProject](https://www.openproject.org/) and [Mattermost](https://mattermost.com/) integration to log time for a work package. This integration is built along the lines of [op-slack-connector](https://github.com/girish17/op-slack-connector)

## Setup and contribution guidelines

- Same as described [here](https://github.com/girish17/op-slack-connector#setup-and-contribution-guidelines).
  - Except for step 3 which invovles creation of `.env` file. The entries in `.env` would contain following:
    - `OP_URL=http://<your host or ip address>:8080/api/v3/    #needed for pointing to OpenProject installation`
    - `INT_URL=<ngrok url>/                                   #needed for exposing the integration running on port 3000`
    - `MM_URL=http://<your host or ip address>:8065/api/v4/    #needed for pointing to Mattermost installation`  
    - `MATTERMOST_ACCESS_TOKEN=<personal access token>        # https://docs.mattermost.com/developer/personal-access-tokens.html`
    - `MATTERMOST_SLASH_TOKEN=<use the mattermost slash command token>  #needed for slash command validation`
    - `OP_ACCESS_TOKEN=<openproject access token obtained from profile page>`
  - Step 7 shall be replaced with creation of Mattermost slash command as described [here](https://docs.mattermost.com/developer/slash-commands.html)

## Demo

![Demo](resource/op-mattermost-demo.gif)
