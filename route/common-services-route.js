'use strict';
const logger = rootRequire('config/logger');
const routes = require('express').Router();

const commonServiceCtrl = rootRequire('controller/account/common-service-ctrl');

routes.post('/accounts/individuals/assurance', commonServiceCtrl.personalAccountAssurance);
routes.post('/accounts/individuals/existence', commonServiceCtrl.checkCustomerExistenceAndSubscription);

module.exports = routes;
