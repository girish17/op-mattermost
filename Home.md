# Welcome to the op-mattermost wiki!

## About op-mattermost
An integration between [OpenProject](https://openproject.org) and [Mattermost](https://mattermost.org). Currently, supports logging time for a work-package, create and delete work-package, get and delete time logs in OpenProject using a slash command (`/op`) created in Mattermost.

## Why develop op-mattermost?
The integration is needed for logging time for work done in a friendly and convenient way through a bot conversation. Also, it is useful in tasks such as create and delete work package, view and delete time logs for a user and others. More use cases can potentially be supported through slash commands or a plugin.

## Why OpenProject and Mattermost?
OpenProject is an open source project management tool available for enterprises. Mattermost is also a _libre_ and open source communication tool which supports bots and integrations useful for teams. OpenProject integration for Mattermost serves as a convenient way to use project management features through a simplified chat with bots. 
The comprehensive [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) API documentation for both [OpenProject](https://openproject.org/docs/api/introduction) and [Mattermost](https://api.mattermost.com/) makes development, deployment and testing seamless. OpenProject and Mattermost packages are maintained by community and is open source, which makes its code and processes transparent for the public audit, bug fixes and review.
## Tools and libraries used
`op-mattermost` is a [Node](https://nodejs.org/en/) [Express](https://expressjs.com/) application written in JavaScript [ES6](http://es6-features.org). It depends on node modules as mentioned [here](https://github.com/girish17/op-mattermost/blob/master/package.json) under the dependencies. Unit testing is managed through [Mocha, Chai and Sinon](https://medium.com/caffeine-and-testing/testing-with-mocha-chai-sinon-quick-start-guide-12f3e47b1a79) `npm` packages. The integration is deployable as a Node package on Heroku, AWS or other cloud platforms.
IDE (community version under an open source license) used for the project: 
![WebStorm logo](https://resources.jetbrains.com/storage/products/company/brand/logos/WebStorm.svg)
