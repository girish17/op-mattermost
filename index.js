'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

require('./resource/routes')(app, axios);