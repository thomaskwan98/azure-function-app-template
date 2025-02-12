'use strict';
const logger = rootRequire('config/logger');
const routes = require('express').Router();

const newslettersSubscriptionCtrl = rootRequire('controller/newsletters/newsletters-subscription-ctrl');

routes.post('/newsletters', newslettersSubscriptionCtrl.post);

module.exports = routes;
