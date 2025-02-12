'use strict';
const logger = rootRequire('config/logger');
const routes = require('express').Router();

const onlineDonationOneOffCtrl = rootRequire('controller/donation/online-donation-one-off-ctrl');

routes.post('/one-off', onlineDonationOneOffCtrl.post);

module.exports = routes;
